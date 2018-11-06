# An example of returning audio as a result.
# This script will return recorded audio back as it is

import json
import sys
import os
import shutil

# The JSON to be returned.
# We will replace the "data" part with 
# audio that was received by the analysis method
data = """
{
    "type": "audio",
    "data": ""
}
"""

# Copy recorded file to somewhere where we can access
# it over HTTP
shutil.copy2(sys.argv[2], './uploads/')

# Load JSON as a dictionary and replace the audio 
# to be returned with the one we received
data = json.loads(data)
data['data'] = './uploads/' + os.path.basename(sys.argv[2])

# Write the results to the output file (first parameter)
with open(sys.argv[1], 'w') as f:
    json.dump(data, f, indent=4)
