// This file is an added error handling for registration of the volunteers
export function formatBackendErrors(error) {
  // If backend returned { error: "Some message" }
  if (typeof error === "string") return error;

  if (error.error && typeof error.error === "string") {
    return error.error;
  }

  // If backend returned something like:
  // { name: ["This field is required"], contact_number: ["Invalid"] }
  if (typeof error === "object") {
    let messages = [];

    for (const key in error) {
      const value = error[key];

      if (Array.isArray(value)) {
        messages.push(`${key}: ${value[0]}`);
      }
    }

    return messages.join("\n");
  }

  return "An unknown error occurred.";
}
