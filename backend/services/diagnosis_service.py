import base64
import json
import mimetypes

from groq import Groq

from backend.config import GROQ_API_KEY, GROQ_VISION_MODEL


client = Groq(api_key=GROQ_API_KEY)

MODEL = GROQ_VISION_MODEL


SYSTEM_PROMPT = """
You are an agricultural crop-health diagnostic assistant.

Analyze the provided crop/plant image.

Your task is to identify visible crop health problems such as:
- plant diseases
- pest infestations
- nutrient deficiency symptoms
- healthy plants

Do not pretend to be certain when the image is unclear.

Return ONLY valid JSON using exactly this structure:

{
    "crop": "string",
    "problem_type": "disease | pest | nutrient_deficiency | healthy | unknown",
    "diagnosis": "string",
    "confidence": 0.0,
    "severity": "none | mild | moderate | severe | unknown",
    "symptoms": [
        "string"
    ],
    "explanation": "string",
    "recommended_action": [
        "string"
    ],
    "needs_expert_review": true
}

Rules:

1. confidence must be between 0 and 1.
2. If the image is unclear, use "unknown".
3. Do not invent symptoms that are not visible.
4. Do not give pesticide dosage instructions.
5. Prefer integrated pest and disease management.
6. If confidence is below 0.70, set needs_expert_review to true.
7. If the image is clearly not a plant/crop image, return unknown.
8. Keep recommendations practical and safe.
"""


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


def encode_image(image_path: str) -> tuple[str, str]:
    """
    Convert a local image into base64 and determine its MIME type.
    """

    with open(image_path, "rb") as image_file:
        image_bytes = image_file.read()

    base64_image = base64.b64encode(image_bytes).decode("utf-8")

    mime_type, _ = mimetypes.guess_type(image_path)

    if mime_type not in {
        "image/jpeg",
        "image/png",
        "image/webp",
    }:
        mime_type = "image/jpeg"

    return base64_image, mime_type


def diagnose_images(image_paths: list[str], language: str = "en") -> dict:

    image_contents = []

    for image_path in image_paths:
        base64_image, mime_type = encode_image(image_path)
        image_contents.append({
            "type": "image_url",
            "image_url": {
                "url": f"data:{mime_type};base64,{base64_image}"
            },
        })

    lang_name = LANGUAGE_NAMES.get(language, "English")
    lang_instruction = (
        f"\n\nIMPORTANT LANGUAGE REQUIREMENT:\n"
        f"All text values in the JSON (specifically 'crop', 'diagnosis', 'symptoms', "
        f"'explanation', and 'recommended_action') MUST be provided in {lang_name}. "
        f"Keep the JSON keys in English as specified, but translate all values into {lang_name}."
    )

    response = client.chat.completions.create(
        model=MODEL,

        messages=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT + lang_instruction,
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": (
                            f"Analyze all provided crop images together. "
                            f"Use the combined visual context and provide "
                            f"the agricultural diagnosis in {lang_name} as JSON."
                        ),
                    },
                    *image_contents,
                ],
            },
        ],

        temperature=0.2,

        max_completion_tokens=1500,

        reasoning_effort="none",

        response_format={
            "type": "json_object"
        },
    )

    content = response.choices[0].message.content

    try:
        result = json.loads(content)
    except json.JSONDecodeError:

        return {
            "crop": "unknown",
            "problem_type": "unknown",
            "diagnosis": "Unable to parse AI diagnosis",
            "confidence": 0,
            "severity": "unknown",
            "symptoms": [],
            "explanation": content,
            "recommended_action": [],
            "needs_expert_review": True,
        }

    return result


def diagnose_image(image_path: str, language: str = "en") -> dict:
    return diagnose_images([image_path], language=language)