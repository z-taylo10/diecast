import pandas as pd
import sys

def convert_excel_to_json(excel_path, output_path='./MockDataJS.json'):
    try:
        df = pd.read_excel(excel_path)
        # Reset index to add an 'ID' column
        df.reset_index(inplace=True)
        df.rename(columns={'index': 'ID'}, inplace=True)
        
        # Check for duplicates and update 'Dupe' column
        df = update_dupe_column(df)
        
        df.to_json(output_path, orient='records')
        print(f"Successfully converted {excel_path} to JSON and saved to {output_path}")
    except Exception as e:
        print(f"Error processing file {excel_path}: {e}")

def update_dupe_column(df):
    # Define the columns to check for duplicates
    columns_to_check = ['BRAND', 'BYEAR', 'SET', 'MAKE', 'MODEL', 'YEAR', 'COLOR']
    
    # Create a set to track seen rows
    seen = set()
    
    # Iterate through the DataFrame and update the 'Dupe' column
    for i, row in df.iterrows():
        # Create a tuple of the row values for the columns to check
        row_tuple = tuple(row[columns_to_check])
        
        # Check if the row has been seen before
        if row_tuple in seen:
            df.at[i, 'Dupe'] = 'Yes'
        else:
            df.at[i, 'Dupe'] = 'No'
            seen.add(row_tuple)
    
    return df

if __name__ == "__main__":
    if len(sys.argv) > 2:
        input_path = sys.argv[1]
        output_path = sys.argv[2]
        convert_excel_to_json(input_path, output_path)
    else:
        print("Usage: python convert_to_json.py <input_path> <output_path>")