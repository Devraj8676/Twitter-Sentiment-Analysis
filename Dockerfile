FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file
COPY backend/requirements.txt .

# Install the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy only the necessary folders (to keep the image light)
COPY backend/ /app/backend/
COPY model_outputs/ /app/model_outputs/

# Hugging Face Spaces expects the app to run on port 7860
ENV PORT=7860
EXPOSE 7860

# Start the application
CMD ["python", "backend/api.py"]
