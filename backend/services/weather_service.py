import requests


GEOCODING_URL = (
    "https://geocoding-api.open-meteo.com/v1/search"
)

WEATHER_URL = (
    "https://api.open-meteo.com/v1/forecast"
)


# ============================================================
# LOCATION SEARCH
# ============================================================

def search_locations(
    location: str,
    count: int = 5
):

    response = requests.get(
        GEOCODING_URL,
        params={
            "name": location,
            "count": count,
            "language": "en",
            "format": "json",
        },
        timeout=10,
    )

    response.raise_for_status()

    data = response.json()

    results = data.get(
        "results",
        []
    )

    locations = []

    for result in results:

        locations.append({

            "name": result.get(
                "name"
            ),

            "country": result.get(
                "country"
            ),

            "country_code": result.get(
                "country_code"
            ),

            "admin1": result.get(
                "admin1"
            ),

            "latitude": result.get(
                "latitude"
            ),

            "longitude": result.get(
                "longitude"
            ),

            "timezone": result.get(
                "timezone"
            ),

        })

    return locations


# ============================================================
# GET LOCATION
# ============================================================

def get_location(
    location: str
):

    results = search_locations(
        location,
        count=1
    )

    if not results:

        raise ValueError(
            f"Location not found: {location}"
        )

    return results[0]


# ============================================================
# WEATHER REQUEST
# ============================================================

def _fetch_weather(
    latitude: float,
    longitude: float,
    location_info: dict
):

    response = requests.get(

        WEATHER_URL,

        params={

            "latitude": latitude,

            "longitude": longitude,

            "current": (
                "temperature_2m,"
                "relative_humidity_2m,"
                "apparent_temperature,"
                "precipitation,"
                "rain,"
                "weather_code,"
                "wind_speed_10m"
            ),

            "hourly": (
                "temperature_2m,"
                "relative_humidity_2m,"
                "precipitation_probability,"
                "precipitation,"
                "rain,"
                "weather_code,"
                "wind_speed_10m,"
                "et0_fao_evapotranspiration"
            ),

            "daily": (
                "weather_code,"
                "temperature_2m_max,"
                "temperature_2m_min,"
                "precipitation_sum,"
                "rain_sum,"
                "precipitation_probability_max,"
                "wind_speed_10m_max,"
                "et0_fao_evapotranspiration"
            ),

            "forecast_days": 7,

            "timezone": "auto",
        },

        timeout=15,
    )

    response.raise_for_status()

    weather = response.json()

    return {

        "location": location_info,

        "current": weather.get(
            "current",
            {}
        ),

        "hourly": weather.get(
            "hourly",
            {}
        ),

        "daily": weather.get(
            "daily",
            {}
        ),

    }


# ============================================================
# WEATHER BY LOCATION NAME
# ============================================================

def get_weather(
    location: str
):

    place = get_location(
        location
    )

    return _fetch_weather(

        place["latitude"],

        place["longitude"],

        place

    )


# ============================================================
# WEATHER BY GPS
# ============================================================

def get_weather_by_coordinates(
    latitude: float,
    longitude: float
):

    # --------------------------------------------------------
    # Reverse geocode GPS coordinates
    # --------------------------------------------------------

    place = {
        "name": "Current Location",
        "country": "",
        "admin1": "",
        "latitude": latitude,
        "longitude": longitude,
        "timezone": "auto",
    }

    try:

        response = requests.get(
            "https://nominatim.openstreetmap.org/reverse",
            params={
                "lat": latitude,
                "lon": longitude,
                "format": "json",
                "zoom": 10,
                "addressdetails": 1,
            },
            headers={
                "User-Agent": "AgroMitr/1.0"
            },
            timeout=10,
        )

        response.raise_for_status()

        data = response.json()

        address = data.get(
            "address",
            {}
        )

        # ----------------------------------------------------
        # Find best available place name
        # ----------------------------------------------------

        name = (
            address.get("city")
            or address.get("town")
            or address.get("municipality")
            or address.get("village")
            or address.get("county")
            or "Current Location"
        )

        state = (
            address.get("state")
            or address.get("state_district")
            or ""
        )

        country = (
            address.get("country")
            or ""
        )

        place = {
            "name": name,
            "country": country,
            "admin1": state,
            "latitude": latitude,
            "longitude": longitude,
            "timezone": "auto",
        }

    except Exception as e:

        print(
            "Reverse geocoding error:",
            e
        )

    # --------------------------------------------------------
    # Get weather using GPS coordinates
    # --------------------------------------------------------

    return _fetch_weather(
        latitude,
        longitude,
        place
    )