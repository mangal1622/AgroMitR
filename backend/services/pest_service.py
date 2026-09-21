import base64
import json
import os
import re

from groq import Groq


# ============================================================
# GROQ CLIENT
# ============================================================

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


# ============================================================
# MODEL
# ============================================================

MODEL_NAME = "qwen/qwen3.6-27b"


# ============================================================
# EXTRACT JSON
# ============================================================

def extract_json(content: str) -> dict:

    content = content.strip()

    # --------------------------------------------------------
    # Remove markdown code fences
    # --------------------------------------------------------

    content = re.sub(
        r"^```(?:json)?\s*",
        "",
        content,
        flags=re.IGNORECASE
    )

    content = re.sub(
        r"\s*```$",
        "",
        content
    )

    content = content.strip()

    # --------------------------------------------------------
    # Direct JSON
    # --------------------------------------------------------

    try:

        return json.loads(content)

    except json.JSONDecodeError:
        pass

    # --------------------------------------------------------
    # Find JSON object inside additional text
    # --------------------------------------------------------

    start = content.find("{")
    end = content.rfind("}")

    if start != -1 and end != -1 and end > start:

        json_text = content[
            start:end + 1
        ]

        try:

            return json.loads(json_text)

        except json.JSONDecodeError as exc:

            raise ValueError(
                "Unable to parse JSON returned by pest model."
            ) from exc

    raise ValueError(
        "Pest detection model did not return JSON."
    )


LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "kn": "Kannada",
    "mr": "Marathi",
    "ta": "Tamil",
    "te": "Telugu",
    "ml": "Malayalam",
    "bn": "Bengali",
    "gu": "Gujarati",
    "pa": "Punjabi",
}


# ============================================================
# PEST DETECTION
# ============================================================

def detect_pest(image_path: str, language: str = "en") -> dict:

    if not os.path.exists(image_path):

        raise FileNotFoundError(
            f"Image not found: {image_path}"
        )

    # --------------------------------------------------------
    # Read image
    # --------------------------------------------------------

    with open(
        image_path,
        "rb"
    ) as image_file:

        image_bytes = image_file.read()

    # --------------------------------------------------------
    # Base64
    # --------------------------------------------------------

    image_base64 = base64.b64encode(
        image_bytes
    ).decode("utf-8")

    # --------------------------------------------------------
    # MIME type
    # --------------------------------------------------------

    extension = os.path.splitext(
        image_path
    )[1].lower()

    mime_types = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
    }

    mime_type = mime_types.get(
        extension,
        "image/jpeg"
    )

    lang_name = LANGUAGE_NAMES.get(language, "English")

    # --------------------------------------------------------
    # Prompt
    # --------------------------------------------------------

    prompt = f"""
Analyze this crop image for visible pest infestation.

You are an agricultural pest identification expert.

Return ONLY ONE JSON OBJECT.

Do not explain the JSON.
Do not use markdown.
Do not use ```.

The JSON must have EXACTLY these fields:

{{
  "crop": "string",
  "pest_detected": true,
  "pest_name": "string",
  "confidence": 0.0,
  "risk_level": "Low",
  "symptoms": ["string"],
  "explanation": "string",
  "recommended_action": ["string"],
  "needs_expert_review": false
}}

Rules:

- Identify the crop if possible.
- Identify the pest only when there is reasonable visual evidence.
- Do not invent a pest.
- If no pest is clearly visible, use:
  "pest_detected": false
  "pest_name": "No clear pest detected"
- confidence must be between 0 and 1.
- risk_level must be exactly:
  "Low", "Moderate", or "High".
- symptoms must describe visible signs.
- Do not invent symptoms.
- explanation must briefly explain the visual evidence.
- recommended_action must contain practical agricultural actions.
- Do not recommend pesticide brands.
- Do not provide chemical dosage instructions.
- Set needs_expert_review to true if the image is unclear.
- Return all nine fields.
- Return valid JSON only.

LANGUAGE REQUIREMENT:
All text values in the JSON (specifically 'crop', 'pest_name', 'symptoms', 'explanation', and 'recommended_action') MUST be provided in {lang_name}. Keep JSON keys in English as specified.
"""

    # --------------------------------------------------------
    # Groq Vision Request
    # --------------------------------------------------------

    response = client.chat.completions.create(

        model=MODEL_NAME,

        messages=[
            {
                "role": "user",
                "content": [

                    {
                        "type": "text",
                        "text": prompt
                    },


                    {
                        "type": "image_url",
                        "image_url": {
                            "url": (
                                f"data:{mime_type};base64,"
                                f"{image_base64}"
                            )
                        }
                    }

                ]
            }
        ],

        # Qwen 3.6 supports reasoning_effort="none".
        # We don't need reasoning for this structured task.
        reasoning_effort="none",

        temperature=0.2,

        max_completion_tokens=1800,

        stream=False
    )

    # --------------------------------------------------------
    # Get model response
    # --------------------------------------------------------

    content = (
        response
        .choices[0]
        .message
        .content
    )

    if not content:

        raise ValueError(
            "Pest detection model returned an empty response."
        )

    print(
        "Pest model response:",
        content
    )

    # --------------------------------------------------------
    # Parse JSON
    # --------------------------------------------------------

    result = extract_json(
        content
    )

    # --------------------------------------------------------
    # Validate
    # --------------------------------------------------------

    if not isinstance(
        result,
        dict
    ):

        raise ValueError(
            "Invalid pest detection response."
        )

    # --------------------------------------------------------
    # Default values
    # --------------------------------------------------------

    result.setdefault(
        "crop",
        "Unknown"
    )

    result.setdefault(
        "pest_detected",
        False
    )

    result.setdefault(
        "pest_name",
        "No clear pest detected"
    )

    result.setdefault(
        "confidence",
        0
    )

    result.setdefault(
        "risk_level",
        "Low"
    )

    result.setdefault(
        "symptoms",
        []
    )

    result.setdefault(
        "explanation",
        ""
    )

    result.setdefault(
        "recommended_action",
        []
    )

    result.setdefault(
        "needs_expert_review",
        False
    )

    # --------------------------------------------------------
    # Normalize confidence
    # --------------------------------------------------------

    try:

        confidence = float(
            result["confidence"]
        )

        # If model returns 95 instead of 0.95
        if confidence > 1:

            confidence /= 100

        confidence = max(
            0,
            min(
                1,
                confidence
            )
        )

        result["confidence"] = confidence

    except (
        ValueError,
        TypeError
    ):

        result["confidence"] = 0

    # --------------------------------------------------------
    # Normalize risk
    # --------------------------------------------------------

    risk_map = {

        "low": "Low",

        "moderate": "Moderate",

        "medium": "Moderate",

        "high": "High"

    }

    risk = str(
        result.get(
            "risk_level",
            "Low"
        )
    ).strip().lower()

    result["risk_level"] = risk_map.get(
        risk,
        "Low"
    )

    # --------------------------------------------------------
    # Ensure symptoms is a list
    # --------------------------------------------------------

    if not isinstance(
        result.get("symptoms"),
        list
    ):

        result["symptoms"] = [
            str(
                result["symptoms"]
            )
        ]

    # --------------------------------------------------------
    # Ensure recommendations is a list
    # --------------------------------------------------------

    if not isinstance(
        result.get(
            "recommended_action"
        ),
        list
    ):

        result["recommended_action"] = [
            str(
                result[
                    "recommended_action"
                ]
            )
        ]

    # --------------------------------------------------------
    # Ensure boolean
    # --------------------------------------------------------

    result["pest_detected"] = bool(
        result.get(
            "pest_detected",
            False
        )
    )

    result["needs_expert_review"] = bool(
        result.get(
            "needs_expert_review",
            False
        )
    )

    # --------------------------------------------------------
    # Return
    # --------------------------------------------------------

    return result