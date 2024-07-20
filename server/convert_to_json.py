import sys
import pandas as pd
import json

def convert_excel_to_json(excel_file, json_file):
    df = pd.read_excel(excel_file)
    # Convert DataFrame to JSON with NaN as null
    data = df.to_json(orient='records', date_format='iso', default_handler=str)
    with open(json_file, 'w') as f:
        f.write(data)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python convert_to_json.py <excel_file> <json_file>")
        sys.exit(1)
    
    excel_file = sys.argv[1]
    json_file = sys.argv[2]
    convert_excel_to_json(excel_file, json_file)