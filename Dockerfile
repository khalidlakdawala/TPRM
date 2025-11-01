# Use the official Nginx image, which is a lightweight and fast web server
FROM nginx:alpine

# Copy the custom script that will configure our application on startup
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Copy all of your application files (index.html, components, etc.) to a temporary folder
COPY . /tmp/app/

# The web server will listen on port 80 inside the container
EXPOSE 80

# This script will run when the container starts
ENTRYPOINT ["/entrypoint.sh"]