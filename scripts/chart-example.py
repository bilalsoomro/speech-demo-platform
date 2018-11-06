# An example of Python script
# being used as an method 

import json
import sys

# Example structure to define Highcharts 
# chart as an output
data = """
{
    "type": "chart", 
    "data": {
        "series": [
            {
                "data": [
                    22
                ], 
                "name": "Test"
            }
        ], 
        "title": {
            "text": "User details"
        }, 
        "chart": {
            "type": "bar"
        }, 
        "xAxis": {
            "categories": [
                "Age"
            ]
        }, 
        "yAxis": {
            "title": {
                "text": "User details"
            }
        }
    }
}
"""

# Load the JSON above as a dictionary
data = json.loads(data)
# Update the names according to parameters this script got.
# We got two additional parameters (name and age), and these
# are appended as arguments when calling this code.
data['data']['series'] = [
    {
        "name": sys.argv[3],
        "data": [
            int(sys.argv[4])
        ]
    }
]

# Open the output file and write our json there
with open(sys.argv[1], 'w') as f:
    json.dump(data, f, indent=4)
