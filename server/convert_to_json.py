import sys
import pandas as pd
import json

def convert_excel_to_json(excel_file, json_file):
    df = pd.read_excel(excel_file)
    # Add ID column incrementally
    df['ID'] = range(1, len(df) + 1)
    # Ensure any column with "Year" in its name is a number
    for column in df.columns:
        if 'Year' in column:
            df[column] = pd.to_numeric(df[column], errors='coerce')
    # Convert DataFrame to JSON with NaN as null
    data = df.to_dict(orient='records')
    with open(json_file, 'w') as f:
        json.dump(data, f, indent=2)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python convert_to_json.py <excel_file> <json_file>")
        sys.exit(1)
    
    excel_file = sys.argv[1]
    json_file = sys.argv[2]
    convert_excel_to_json(excel_file, json_file)