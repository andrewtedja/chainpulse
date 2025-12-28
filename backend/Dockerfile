FROM python:3.11-slim

WORKDIR /app

# copy deps
COPY requirements.txt ./

# install deps
RUN pip install --no-cache-dir -r requirements.txt

# copy rest of code
COPY . .

# expose port
EXPOSE 8000

# start app using uvicorn with reload for dev
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
