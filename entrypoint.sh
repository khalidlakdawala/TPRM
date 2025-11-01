#!/bin/sh

# This script runs when the Docker container starts.
# It creates a small piece of Javascript containing your API key.
# The API_KEY variable is securely passed in when you run the container.
echo "<script>window.process = { env: { API_KEY: '$API_KEY' } };</script>" > /tmp/env.snippet

# This command cleverly inserts the API key script into your index.html file
# right before the closing </head> tag, without modifying your original file in Git.
awk '/<\/head>/{print readfile("/tmp/env.snippet")}1' readfile=/tmp/env.snippet /tmp/app/index.html > /usr/share/nginx/html/index.html

# Copy the rest of your application files to the web server's public directory
cp -r /tmp/app/* /usr/share/nginx/html/

# Start the Nginx web server
exec nginx -g 'daemon off;'