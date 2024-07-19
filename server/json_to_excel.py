import pandas as pd
import sys

def json_to_excel(json_path, excel_path):
    df = pd.read_json(json_path)
    # Remove ID
    if 'ID' in df.columns:
        df = df.drop('ID', axis=1)
    df.to_excel(excel_path, index=False)

if __name__ == "__main__":
    if len(sys.argv) > 2:
        json_path = sys.argv[1]
        excel_path = sys.argv[2]
        json_to_excel(json_path, excel_path)
    else:
        print("Usage: python json_to_excel.py <json_path> <excel_path>")