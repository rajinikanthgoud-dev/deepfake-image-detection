Deepfake Image Detection Using Deep Learning

A web-based application that detects whether an uploaded image is Real or Fake using deep learning models.

Project Overview

This project uses deep learning techniques to identify manipulated or AI-generated images. It provides a web interface where users can upload an image and view the prediction.

Technologies Used

Backend

- Python
- Flask
- PyTorch
- TIMM
- OpenCV
- NumPy
- Pillow

Frontend

- React.js
- Vite
- JavaScript
- CSS

Project Structure

deepfake-image-detection/
├── backend/
│   ├── app.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md

Features

- Upload an image for analysis
- Deep learning-based image classification
- Predicts Real or Fake
- Web-based user interface

Installation

Backend

cd backend
pip install -r requirements.txt
python app.py

Frontend

cd frontend
npm install
npm run dev

Model

The project uses a PyTorch deep learning model for image classification.

Author

G Rajinikanth Goud

GitHub: "rajikanthgoud-dev" (https://github.com/rajikanthgoud-dev)
