import { API_SUB_URL } from "../config/config";

export const getTodayZodiac = async (date) => {
  try {
    const response = await fetch(
      `${API_SUB_URL}/dream/today-zodiac/get/${date}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();

    if (data.error) {
      return null;
    } else {
      return data;
    }
  } catch (error) {
    console.error("Failed to load share data:", error);
    throw error;
  }
};

export const getTodayZodiacFortune = async (todayZodiac) => {
  const response = await fetch("/api/zodiac", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(todayZodiac),
  });
  const data = await response.json();
  const zodiacData = JSON.parse(data.result);

  return zodiacData;
};

export const saveTodayZodiac = async (date, zodiac) => {
  try {
    const response = await fetch(`${API_SUB_URL}/dream/today-zodiac/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date: date,
        zodiac: zodiac,
      }),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();

    if (data.error) {
      return null;
    } else {
      return data;
    }
  } catch (error) {
    console.error("Failed to load share data:", error);
    throw error;
  }
};
