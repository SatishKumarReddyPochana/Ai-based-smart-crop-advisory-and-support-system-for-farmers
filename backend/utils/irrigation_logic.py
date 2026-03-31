# backend/utils/irrigation_logic.py
from math import floor

# Constants
M2_PER_ACRE = 4046.86  # square meters in one acre

# Crop config: Kc (crop coefficient) per season + typical harvest days

CROP_CONFIG = {
    "rice":        {"kharif_kc": 1.2,  "rabi_kc": 1.1,  "harvest_days": 120},
    "wheat":       {"kharif_kc": 0.9,  "rabi_kc": 1.0,  "harvest_days": 110},
    "maize":       {"kharif_kc": 1.05, "rabi_kc": 0.95, "harvest_days": 100},
    "sorghum":     {"kharif_kc": 0.95, "rabi_kc": 0.85, "harvest_days": 115},
    "millet":      {"kharif_kc": 0.9,  "rabi_kc": 0.85, "harvest_days": 90},
    "barley":      {"kharif_kc": 0.85, "rabi_kc": 0.9,  "harvest_days": 95},

    # Pulses
    "pigeon_pea":  {"kharif_kc": 0.9,  "rabi_kc": 0.85, "harvest_days": 150},
    "black_gram":  {"kharif_kc": 0.85, "rabi_kc": 0.8,  "harvest_days": 95},
    "green_gram":  {"kharif_kc": 0.85, "rabi_kc": 0.8,  "harvest_days": 85},
    "chickpea":    {"kharif_kc": 0.8,  "rabi_kc": 0.9,  "harvest_days": 110},
    "lentil":      {"kharif_kc": 0.8,  "rabi_kc": 0.85, "harvest_days": 120},

    # Oilseeds
    "groundnut":   {"kharif_kc": 1.0,  "rabi_kc": 0.85, "harvest_days": 120},
    "soybean":     {"kharif_kc": 0.95, "rabi_kc": 0.85, "harvest_days": 110},
    "sunflower":   {"kharif_kc": 0.9,  "rabi_kc": 0.85, "harvest_days": 95},
    "mustard":     {"kharif_kc": 0.85, "rabi_kc": 0.9,  "harvest_days": 100},
    "sesame":      {"kharif_kc": 0.85, "rabi_kc": 0.8,  "harvest_days": 85},

    # Commercial crops
    "cotton":      {"kharif_kc": 1.1,  "rabi_kc": 1.0,  "harvest_days": 180},
    "sugarcane":   {"kharif_kc": 1.25, "rabi_kc": 1.25, "harvest_days": 300},
    "tobacco":     {"kharif_kc": 1.1,  "rabi_kc": 1.0,  "harvest_days": 150},
    "jute":        {"kharif_kc": 1.1,  "rabi_kc": 0.9,  "harvest_days": 150},

    # Vegetables
    "tomato":      {"kharif_kc": 1.0,  "rabi_kc": 0.95, "harvest_days": 90},
    "potato":      {"kharif_kc": 0.95, "rabi_kc": 0.9,  "harvest_days": 90},
    "onion":       {"kharif_kc": 0.95, "rabi_kc": 0.9,  "harvest_days": 120},
    "brinjal":     {"kharif_kc": 1.0,  "rabi_kc": 0.95, "harvest_days": 140},
    "cabbage":     {"kharif_kc": 0.9,  "rabi_kc": 0.85, "harvest_days": 90},
    "cauliflower": {"kharif_kc": 0.9,  "rabi_kc": 0.85, "harvest_days": 95},
    "chilli":      {"kharif_kc": 0.95, "rabi_kc": 0.9,  "harvest_days": 120},
    "okra":        {"kharif_kc": 0.95, "rabi_kc": 0.9,  "harvest_days": 70},

    # Fruits
    "banana":      {"kharif_kc": 1.2,  "rabi_kc": 1.2,  "harvest_days": 300},
    "mango":       {"kharif_kc": 0.85, "rabi_kc": 0.85, "harvest_days": 365},
    "grapes":      {"kharif_kc": 0.9,  "rabi_kc": 0.95, "harvest_days": 150},
    "papaya":      {"kharif_kc": 1.1,  "rabi_kc": 1.1,  "harvest_days": 240},
    "pomegranate": {"kharif_kc": 0.9,  "rabi_kc": 0.9,  "harvest_days": 180},

    # Spices
    "turmeric":    {"kharif_kc": 1.0,  "rabi_kc": 0.95, "harvest_days": 260},
    "ginger":      {"kharif_kc": 1.05, "rabi_kc": 1.0,  "harvest_days": 240},
    "coriander":   {"kharif_kc": 0.85, "rabi_kc": 0.9,  "harvest_days": 110},
}


def _get_kc_for_crop(crop_name: str, season: str):
    crop = CROP_CONFIG.get(crop_name.lower())
    if not crop:
        # default kc and harvest days if crop unknown
        return 1.0, 120
    season_lower = season.lower()
    if season_lower == "kharif":
        return crop.get("kharif_kc", crop.get("rabi_kc", 1.0)), crop.get("harvest_days", 120)
    else:
        return crop.get("rabi_kc", crop.get("kharif_kc", 1.0)), crop.get("harvest_days", 120)

def estimate_et0(temp_c: float, humidity_pct: float, wind_m_s: float = 1.5):
    """
    Simple empirical ET0 estimator (lightweight approximation).
    This is not a full FAO Penman-Monteith implementation, but gives a practical estimate.
    Returns ET0 in mm/day.
    """
    # baseline
    et0 = 4.0
    # temperature effect
    et0 += (temp_c - 25.0) * 0.08
    # humidity reduces evapotranspiration
    et0 -= (humidity_pct - 50.0) * 0.02
    # wind increases evapotranspiration
    et0 += (wind_m_s - 1.5) * 0.2
    # clamp to reasonable range
    if et0 < 1.0:
        et0 = 1.0
    if et0 > 8.0:
        et0 = 8.0
    return round(et0, 3)

def soil_moisture_adjustment(soil_moisture_pct: float):
    """
    Returns a multiplicative adjustment factor based on soil moisture:
    - very dry (<20) -> +40%
    - 20-40 -> +20%
    - 40-60 -> normal
    - >60 -> -20%
    """
    if soil_moisture_pct < 20:
        return 1.4
    if soil_moisture_pct < 40:
        return 1.2
    if soil_moisture_pct <= 60:
        return 1.0
    return 0.8

def rainfall_reduction_factor(recent_rainfall_mm: float):
    """
    Returns fraction to subtract from required irrigation based on rainfall.
    Example: rainfall >20mm -> skip irrigation (factor 0), 10-20 -> reduce 30%, etc.
    The function returns a multiplier to apply to irrigation need (1.0 = no change).
    """
    if recent_rainfall_mm > 20:
        return 0.0
    if recent_rainfall_mm > 10:
        return 0.7  # reduce 30%
    if recent_rainfall_mm > 0:
        return 0.9  # small reduction
    return 1.0

def litres_per_acre_from_mm(mm_of_water: float):
    """1 mm over 1 m^2 = 1 liter. Convert mm to liters per acre."""
    return mm_of_water * M2_PER_ACRE

def determine_frequency(liters_per_acre_day: float):
    """
    Heuristic to determine times per day/week.
    Returns: {"times_per_day": int or 0, "times_per_week": int}
    """
    if liters_per_acre_day >= 3000:
        return {"times_per_day": 2, "times_per_week": 14}
    if liters_per_acre_day >= 1500:
        return {"times_per_day": 1, "times_per_week": 7}
    if liters_per_acre_day >= 500:
        return {"times_per_day": 0, "times_per_week": 3}
    return {"times_per_day": 0, "times_per_week": 2}

def calculate_irrigation_details(
    season: str,
    crop: str,
    soil_moisture_pct: float,
    recent_rainfall_mm: float,
    acres: float,
    weather: dict = None
):
    """
    Main function to compute irrigation plan.
    weather: optional dict with keys: temperature (C), humidity (%), wind (m/s)
    Returns a dict with per-acre liters/day, total liters/day, frequency, harvest days, and a table-like summary.
    """
    if weather is None:
        # fallback default weather
        weather = {"temperature": 28.0, "humidity": 50.0, "wind": 1.5}

    temp = float(weather.get("temperature", 28.0))
    humidity = float(weather.get("humidity", 50.0))
    wind = float(weather.get("wind", 1.5))

    kc, harvest_days = _get_kc_for_crop(crop, season)

    # estimate ET0 (mm/day)
    et0_mm = estimate_et0(temp, humidity, wind)

    # crop water requirement in mm/day
    cwr_mm = et0_mm * kc

    # adjust for soil moisture
    soil_adj = soil_moisture_adjustment(float(soil_moisture_pct))

    # rainfall reduction factor
    rain_mult = rainfall_reduction_factor(float(recent_rainfall_mm))

    # effective irrigation requirement in mm/day
    effective_mm = cwr_mm * soil_adj * rain_mult
    # avoid negative or zero issues
    if effective_mm < 0:
        effective_mm = 0.0

    # convert to liters per acre
    litres_per_acre = round(litres_per_acre_from_mm(effective_mm), 2)
    total_litres = round(litres_per_acre * float(acres), 2)

    # frequency heuristics
    freq = determine_frequency(litres_per_acre)

    # days to harvest is harvest_days (could be enhanced to calculate remaining days by crop stage)
    days_to_harvest = int(harvest_days)

    # build table-like summary
    summary = {
        "season": season,
        "crop": crop,
        "soil_moisture_pct": soil_moisture_pct,
        "recent_rainfall_mm": recent_rainfall_mm,
        "temperature_c": temp,
        "humidity_pct": humidity,
        "et0_mm_per_day": et0_mm,
        "kc": kc,
        "cwr_mm_per_day": round(cwr_mm, 3),
        "effective_mm_per_day": round(effective_mm, 3),
        "litres_per_acre_per_day": litres_per_acre,
        "total_litres_per_day": total_litres,
        "frequency": freq,
        "days_to_harvest": days_to_harvest,
    }

    return summary
print("✅ ")