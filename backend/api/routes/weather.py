from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.services.weather_service import (
    get_weather,
    search_locations,
    get_weather_by_coordinates,
)


router = APIRouter(
    prefix="/weather",
    tags=["Weather"],
)


class WeatherRequest(BaseModel):
    location: str


class CoordinatesRequest(BaseModel):
    latitude: float
    longitude: float


# ============================================================
# LOCATION SEARCH
# GET /weather/search
# ============================================================

@router.get("/search")
async def search_weather_locations(
    query: str
):

    query = query.strip()

    if not query:
        return {
            "results": []
        }

    try:

        results = search_locations(
            query
        )

        return {
            "results": results
        }

    except Exception as e:

        print(
            "Location search error:",
            e
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to search locations."
        )


# ============================================================
# WEATHER BY LOCATION
# POST /weather/
# ============================================================

@router.post("/")
async def weather(
    request: WeatherRequest
):

    location = request.location.strip()

    if not location:

        raise HTTPException(
            status_code=400,
            detail="Location is required."
        )

    try:

        result = get_weather(
            location
        )

        return {
            "success": True,
            "weather": result,
        }

    except ValueError as e:

        raise HTTPException(
            status_code=404,
            detail=str(e)
        )

    except Exception as e:

        print(
            "Weather error:",
            e
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to retrieve weather data."
            )
        )


# ============================================================
# WEATHER BY GPS COORDINATES
# POST /weather/coordinates
# ============================================================

@router.post("/coordinates")
async def weather_coordinates(
    request: CoordinatesRequest
):

    try:

        result = get_weather_by_coordinates(
            request.latitude,
            request.longitude
        )

        return {
            "success": True,
            "weather": result,
        }

    except Exception as e:

        print(
            "GPS weather error:",
            e
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to retrieve weather "
                "for your current location."
            )
        )