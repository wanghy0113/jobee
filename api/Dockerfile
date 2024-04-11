# Use an official Python runtime as a parent image
FROM python:3.11

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the current directory contents into the container at /usr/src/app
COPY . .

# Install Playwright
RUN pip install playwright
RUN playwright install
RUN playwright install-deps

RUN pip install poetry

# Install any needed packages specified in requirements.txt
RUN poetry install

# Run main.py when the container launches
CMD poetry run python server.py
