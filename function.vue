const processImageWithRegula = async (imageBase64: string) => {
  try {
    const processParam = {
      images: [imageBase64],
      processParam: {
        scenario: Scenario.FULL_PROCESS,
      },
    };

    // ✅ Send request to Regula's API
    const response = await api.process(processParam);

    // ✅ Extract text fields
    const textFields = response.text?.fields || [];

    if (textFields.length === 0) {
      resultMessage.value = "No text data found.";
      return;
    }

    // ✅ Extract and parse JSON data
    const extractedData = textFields.map(field => {
      const rawText = field.valueList[0]?.value; // Assuming first value is the JSON string
      let parsedJson;
      
      try {
        parsedJson = JSON.parse(rawText); // Try to parse the string as JSON
      } catch (error) {
        parsedJson = rawText; // If parsing fails, keep it as a string
      }

      return { fieldType: field.type, data: parsedJson };
    });

    // ✅ Display in the UI
    console.log("Extracted Data (Parsed JSON):", extractedData);
    resultMessage.value = JSON.stringify(extractedData, null, 2); // Pretty print JSON

  } catch (error) {
    console.error("Error extracting text data from Regula:", error);
    resultMessage.value = 'Error extracting text data.';
  }
};
