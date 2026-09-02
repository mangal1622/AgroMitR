import json
import os
import re
from typing import Any

from groq import Groq


# ============================================================
# GROQ CLIENT
# ============================================================

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise RuntimeError(
        "GROQ_API_KEY is not set in the environment."
    )

client = Groq(api_key=api_key)


# ============================================================
# MODEL
# ============================================================

# You can override this in .env:
#
# GROQ_MODEL=your-working-model
#
# Keeping it configurable means you don't need to modify
# this file if Groq changes model availability again.

MODEL = os.getenv(
    "GROQ_MODEL",
    "llama-3.1-8b-instant"
)


# ============================================================
# SUPPORTED LANGUAGES
# ============================================================

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
# LANGUAGE SCRIPT INSTRUCTIONS
# ============================================================

LANGUAGE_INSTRUCTIONS = {
    "English": """
Use normal English.
""",

    "Hindi": """
Use Hindi written in Devanagari script.
Do NOT use Marathi or another language.
Translate common crop, disease, symptom, severity and
agricultural terminology into natural Hindi.
""",

    "Kannada": """
Use Kannada script.
Translate all natural-language agricultural terminology
into Kannada.
""",

    "Marathi": """
Use Marathi written in Devanagari script.
Do NOT translate into Hindi.
Use natural Marathi vocabulary and grammar.
Even though Marathi and Hindi use the same script,
the actual words must be Marathi.
""",

    "Tamil": """
Use Tamil script.
Translate all natural-language agricultural terminology
into Tamil.
""",

    "Telugu": """
Use Telugu script.
Translate all natural-language agricultural terminology
into Telugu.
""",

    "Malayalam": """
Use Malayalam script.
Translate all natural-language agricultural terminology
into Malayalam.
""",

    "Bengali": """
Use Bengali script.
Translate all natural-language agricultural terminology
into Bengali.
""",

    "Gujarati": """
Use Gujarati script.
Translate all natural-language agricultural terminology
into Gujarati.
""",

    "Punjabi": """
Use Punjabi written in Gurmukhi script.
Translate all natural-language agricultural terminology
into Punjabi.
""",
}


# ============================================================
# COLLECT ALL TEXT VALUES
# ============================================================

def collect_strings(
    value: Any,
    path: str = ""
) -> list[dict[str, str]]:
    """
    Recursively collect every string from a dictionary/list.

    Example:

    {
        "crop": "Tomato",
        "symptoms": [
            "Yellow leaves",
            "Brown spots"
        ]
    }

    becomes:

    [
        {"path": "crop", "text": "Tomato"},
        {"path": "symptoms[0]", "text": "Yellow leaves"},
        {"path": "symptoms[1]", "text": "Brown spots"}
    ]
    """

    items = []

    if isinstance(value, dict):

        for key, child in value.items():

            child_path = (
                f"{path}.{key}"
                if path
                else str(key)
            )

            items.extend(
                collect_strings(
                    child,
                    child_path
                )
            )

    elif isinstance(value, list):

        for index, child in enumerate(value):

            child_path = (
                f"{path}[{index}]"
                if path
                else f"[{index}]"
            )

            items.extend(
                collect_strings(
                    child,
                    child_path
                )
            )

    elif isinstance(value, str):

        if value.strip():

            items.append({
                "path": path,
                "text": value
            })

    return items


# ============================================================
# SET VALUE USING PATH
# ============================================================

def set_value(
    data: Any,
    path: str,
    new_value: str
) -> None:
    """
    Replace a string in the original nested structure.

    Supports paths such as:

        crop
        explanation
        symptoms[0]
        recommended_action[2]
    """

    # --------------------------------------------------------
    # Convert:
    #
    # symptoms[0].text
    #
    # into:
    #
    # symptoms / 0 / text
    # --------------------------------------------------------

    tokens = re.findall(
        r"([^.\\[\\]]+)|\\[(\\d+)\\]",
        path
    )

    parts = []

    for name, index in tokens:

        if name:
            parts.append(name)

        elif index:
            parts.append(int(index))

    if not parts:
        return

    current = data

    for part in parts[:-1]:

        if isinstance(part, int):

            if not isinstance(current, list):
                return

            if part >= len(current):
                return

            current = current[part]

        else:

            if not isinstance(current, dict):
                return

            if part not in current:
                return

            current = current[part]

    final_part = parts[-1]

    if isinstance(final_part, int):

        if isinstance(current, list) and final_part < len(current):
            current[final_part] = new_value

    else:

        if isinstance(current, dict):
            current[final_part] = new_value


# ============================================================
# TRANSLATE ALL STRINGS
# ============================================================

def translate_strings(
    strings: list[dict[str, str]],
    target_language: str,
) -> dict[str, str]:

    if not strings:
        return {}

    language_instruction = LANGUAGE_INSTRUCTIONS.get(
        target_language,
        ""
    )

    # --------------------------------------------------------
    # Create indexed translation input
    # --------------------------------------------------------

    translation_input = []

    for index, item in enumerate(strings):

        translation_input.append({
            "id": index,
            "text": item["text"]
        })

    prompt = f"""
You are a professional agricultural translator.

Translate EVERY text value in the JSON array below into
{target_language}.

LANGUAGE REQUIREMENTS:
{language_instruction}

VERY IMPORTANT:

1. Translate EVERY item.
2. Do NOT skip any item.
3. Do NOT leave ordinary English words untranslated.
4. Translate crop names.

Examples:

Tomato -> translate into the target language.
Grapevine -> translate into the target language.
Disease -> translate into the target language.
Pest -> translate into the target language.
Moderate -> translate into the target language.
Unknown -> translate into the target language.
Early Blight -> translate into the target language.
Downy Mildew -> translate into the target language.

5. Translate ALL of these types of content:

- crop
- problem_type
- diagnosis
- severity
- symptoms
- explanation
- recommended actions
- agricultural terminology
- UI-visible diagnosis text

6. Preserve scientific/Latin names.

For example:

Alternaria solani
Plasmopara viticola
Aceria species

should remain unchanged when they are scientific names.

7. If a scientific name appears together with a common
disease name, translate the common disease name but preserve
the scientific name.

Example:

Early Blight (Alternaria solani)

should become the target-language equivalent of:

Early Blight (Alternaria solani)

with only "Early Blight" translated.

8. Preserve numbers exactly.

9. Preserve percentages and measurements.

10. Do not add information.

11. Do not remove information.

12. Do not summarize.

13. Do not explain your translations.

14. Return ONLY valid JSON.

15. The output MUST contain exactly one object for every
input item.

16. Keep the "id" unchanged.

17. The translated text must be placed in the "text" field.

EXPECTED OUTPUT FORMAT:

[
  {{
    "id": 0,
    "text": "translated text"
  }},
  {{
    "id": 1,
    "text": "translated text"
  }}
]

INPUT:

{json.dumps(
    translation_input,
    ensure_ascii=False,
    indent=2
)}
"""

    # --------------------------------------------------------
    # Groq request
    # --------------------------------------------------------

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a precise agricultural translator. "
                    "Translate every supplied string and never "
                    "skip ordinary text."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        temperature=0.1,
        max_tokens=6000,
    )

    content = (
        response.choices[0]
        .message
        .content
        .strip()
    )

    # --------------------------------------------------------
    # Remove markdown fences
    # --------------------------------------------------------

    if content.startswith("```json"):
        content = content[7:]

    elif content.startswith("```"):
        content = content[3:]

    if content.endswith("```"):
        content = content[:-3]

    content = content.strip()

    # --------------------------------------------------------
    # Parse JSON
    # --------------------------------------------------------

    try:

        translated_items = json.loads(content)

    except json.JSONDecodeError as exc:

        raise ValueError(
            "Translation model returned invalid JSON."
        ) from exc

    # --------------------------------------------------------
    # Validate response
    # --------------------------------------------------------

    if not isinstance(
        translated_items,
        list
    ):

        raise ValueError(
            "Translation model did not return a JSON array."
        )

    translated_map = {}

    for item in translated_items:

        if not isinstance(item, dict):
            continue

        if "id" not in item:
            continue

        if "text" not in item:
            continue

        item_id = item["id"]

        translated_text = item["text"]

        if not isinstance(
            item_id,
            int
        ):
            continue

        if not isinstance(
            translated_text,
            str
        ):
            continue

        translated_map[
            str(item_id)
        ] = translated_text

    # --------------------------------------------------------
    # Make sure every item was returned
    # --------------------------------------------------------

    missing = []

    for index in range(len(strings)):

        if str(index) not in translated_map:

            missing.append(index)

    if missing:

        raise ValueError(
            "Translation model skipped text items: "
            + ", ".join(map(str, missing))
        )

    return {
        strings[index]["path"]: translated_map[str(index)]
        for index in range(len(strings))
    }


# ============================================================
# MAIN TRANSLATION FUNCTION
# ============================================================

def translate_diagnosis(
    diagnosis: dict,
    language: str
) -> dict:

    # --------------------------------------------------------
    # Validate input
    # --------------------------------------------------------

    if not isinstance(
        diagnosis,
        dict
    ):

        raise ValueError(
            "Diagnosis must be a JSON object."
        )

    # --------------------------------------------------------
    # Normalize language
    # --------------------------------------------------------

    language = (
        language
        .strip()
        .lower()
    )

    if language not in LANGUAGE_NAMES:

        raise ValueError(
            f"Unsupported language: {language}"
        )

    # --------------------------------------------------------
    # English requires no translation
    # --------------------------------------------------------

    if language == "en":

        return diagnosis

    target_language = LANGUAGE_NAMES[language]

    # --------------------------------------------------------
    # Copy original diagnosis
    # --------------------------------------------------------

    translated_diagnosis = json.loads(
        json.dumps(
            diagnosis,
            ensure_ascii=False
        )
    )

    # --------------------------------------------------------
    # Find EVERY string
    # --------------------------------------------------------

    strings = collect_strings(
        translated_diagnosis
    )

    if not strings:

        return translated_diagnosis

    # --------------------------------------------------------
    # Translate EVERY string
    # --------------------------------------------------------

    translations = translate_strings(
        strings,
        target_language
    )

    # --------------------------------------------------------
    # Put translated values back
    # --------------------------------------------------------

    for path, translated_text in translations.items():

        set_value(
            translated_diagnosis,
            path,
            translated_text
        )

    return translated_diagnosis