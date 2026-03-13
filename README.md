# 🎟️ Smart Event Management System (SEMS)

[![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue?logo=githubactions)](https://github.com/KaveenAshara01/Smart-Event-Management-System---Microservices/actions)
[![AWS ECS](https://img.shields.io/badge/Deployed-AWS%20ECS-FF9900?logo=amazonaws)](https://aws.amazon.com/ecs/)
[![Docker](https://img.shields.io/badge/Containerized-Docker-2496ED?logo=docker)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A scalable, robust, and fully containerized **Smart Event Management System** built with a Microservices Architecture. This platform allows users to seamlessly discover, book, and manage events, while providing organizers with powerful tools to oversee their events and audiences.

---

## 🏗️ Architecture Overview

The system is designed using a modern microservices pattern to ensure scalability, independent deployability, and fault isolation.

It consists of **6 primary services**:

1.  **Frontend Service**: A responsive, dynamic React application served via Nginx.
2.  **API Gateway**: The centralized entry point that securely routes external requests to the appropriate internal microservices.
3.  **User Service**: Manages user authentication (JWT), profiles, and roles (Attendee, Organizer, Admin).
4.  **Event Service**: Handles the creation, discovery, and management of events.
5.  **Ticket Service**: Processes ticket bookings and manages ticket inventory.
6.  **Notification Service**: An event-driven service listening to RabbitMQ queues to send asynchronous email notifications (e.g., Welcome Emails, Ticket QR Codes).

### 🔄 Inter-Service Communication
- **Synchronous**: API Gateway to Microservices via REST over HTTP.
- **Asynchronous**: Microservices to Notification Service via AMQP (RabbitMQ/CloudAMQP) for detached background processing.
- **Service Discovery**: Managed by **AWS Cloud Map**, allowing services to communicate securely using internal DNS names (e.g., `user-service.sems.internal`).

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS, Axios |
| **API Gateway** | Node.js, Express, express-http-proxy |
| **Microservices** | Node.js, Express, Mongoose |
| **Database** | MongoDB Atlas (NoSQL) |
| **Message Broker** | RabbitMQ (CloudAMQP) |
| **Media Storage** | Cloudinary |
| **Containerization** | Docker, Docker Compose |
| **CI/CD Security** | Snyk (SAST Vulnerability Scanning) |
| **Cloud Deployment** | AWS ECS (Fargate), Amazon ECR, Cloud Map |

---

## 🚀 Cloud Deployment (AWS)

This application is fully automated for cloud deployment utilizing a professional DevSecOps pipeline:

1.  **Push to `main`**: Developer pushes code to the GitHub repository.
2.  **DevSecOps Scan**: GitHub Actions triggers **Snyk** to scan all 6 `package.json` files for security vulnerabilities.
3.  **Build & Tag**: Docker images are built for the Frontend, Gateway, and all Microservices.
4.  **Registry Push**: Images are pushed to **Amazon Elastic Container Registry (ECR)**.
5.  **Automated Rollout**: The AWS CLI updates the **Amazon Elastic Container Service (ECS)** Fargate cluster, pulling the new images and performing a zero-downtime rolling update.

The entire backend network runs inside a private **AWS VPC**, protected by tight Security Groups, ensuring microservices cannot be accessed directly from the public internet.

---

## 💻 Running the Project Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Docker](https://www.docker.com/) (Optional, for containerized local running)
- MongoDB Atlas URI
- Cloudinary Credentials
- CloudAMQP URL

### 1. Environment Variables
You must create a `.env` file in the **Gateway** and **each of the 4 Microservices**. 
Example `.env` for the User Service:
```env
PORT=5001
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_super_secret_key
RABBITMQ_URL=your_cloudamqp_url
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2. Install Dependencies
Run this in the root directory, or individually in every service folder:
```bash
# In Gateway and all 4 services
npm install

# In Frontend
cd frontend
npm install
```

### 3. Start the Services
Open separate terminals for each service and run:
```bash
npm run dev
```
*(Ensure all services are running on their designated ports: 4000 for Gateway, 5001-5004 for microservices, and 3000 for Frontend).*

---

