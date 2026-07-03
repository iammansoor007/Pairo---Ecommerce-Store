import { NextResponse } from "next/server";
import { Country, State, City } from "country-state-city";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const countryCode = searchParams.get("countryCode");
    const stateCode = searchParams.get("stateCode");

    // 1. Get Cities of a specific State in a Country
    if (countryCode && stateCode) {
      const cities = City.getCitiesOfState(countryCode, stateCode);
      const formattedCities = cities.map((city) => ({
        name: city.name,
      }));
      return NextResponse.json({ success: true, data: formattedCities });
    }

    // 2. Get States of a specific Country
    if (countryCode) {
      const states = State.getStatesOfCountry(countryCode);
      const formattedStates = states.map((state) => ({
        name: state.name,
        isoCode: state.isoCode,
      }));
      return NextResponse.json({ success: true, data: formattedStates });
    }

    // 3. Get All Countries
    const countries = Country.getAllCountries();
    const formattedCountries = countries.map((country) => ({
      name: country.name,
      isoCode: country.isoCode,
    }));

    return NextResponse.json({ success: true, data: formattedCountries });
  } catch (error) {
    console.error("[Locations API] Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
