import json
from bson import BSON
from bson.json_util import dumps

# Path to your BSON file
bson_file_path = r"C:\Users\steve\Downloads\world-mongodb-dump\mongodb-dump\world\cities.bson"

# Read BSON file
with open(bson_file_path, "rb") as bson_file:
    bson_data = bson_file.read()

# Decode BSON to Python dict
document = BSON.decode(bson_data)

# Convert the Python dictionary to a JSON string (with proper formatting)
json_data = dumps(document)

# Optionally, print the JSON data
print(json_data)

# Write the JSON data to a file
output_json_path = r"C:\Users\steve\Downloads\world-mongodb-dump\mongodb-dump\world\cities.json"

# Write the JSON data to a file
with open(output_json_path, "w") as json_file:
    json_file.write(json_data)
