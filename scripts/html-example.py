# An example of Python script
# being used as an method 

import json
import sys

# The "data" contains html we will 
# place on the webpage as it is.
# I.e. You could share audio and such with this
data = """
{
    "type": "html",
    "data": "<p>This output is HTML code</p>"
}
"""

# Dump the example into output file
with open(sys.argv[1], 'w') as f:
    f.write(data)
