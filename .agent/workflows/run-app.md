---
description: how to run the full SEMS application locally
---

# Local Execution Guide (SEMS)

Follow these steps to run all microservices and the frontend on your local machine.

## Prerequisites
- **Node.js**: v18 or higher.
- **RabbitMQ**: Must be running locally (default port 5672). 
  - *Tip*: If you have Docker, run: `docker run -it --rm --name rabbitmq --platform linux/amd64 -p 5672:5672 -p 15672:15672 rabbitmq:3.13-management`
- **MongoDB Atlas**: Ensure your IP is whitelisted in your Atlas cluster.

## Step 1: Install Dependencies
Open a terminal in the root directory and run:

// turbo
```powershell
# Install for all services
cd gateway; npm install; cd ..
cd services/user-service; npm install; cd ../..
cd services/event-service; npm install; cd ../..
cd services/ticket-service; npm install; cd ../..
cd services/notification-service; npm install; cd ../..
cd frontend; npm install; cd ..
```

## Step 2: Start Backend Services
You will need to run these in **separate terminal windows** (or tabs):

1. **Gateway** (Port 4000):
   ```powershell
   cd gateway
   npm run dev
   ```

2. **User Service** (Port 5001):
   ```powershell
   cd services/user-service
   npm run dev
   ```

3. **Event Service** (Port 5002):
   ```powershell
   cd services/event-service
   npm run dev
   ```

4. **Ticket Service** (Port 5003):
   ```powershell
   cd services/ticket-service
   npm run dev
   ```

5. **Notification Service** (Port 5004):
   ```powershell
   cd services/notification-service
   npm run dev
   ```

## Step 3: Start Frontend
In a new terminal:
```powershell
cd frontend
npm run dev
```
The app will be available at `http://localhost:5173` (or the port Vite provides).

## Step 4: Verification Flow
1. **Register/Login**: Create a new account.
2. **Profile**: Update your name or profile picture to verify the User Service.
3. **Events**: Go to the Events page and create an event (System assigns Admin/Organizer roles as needed).
4. **Booking**: View the event details and click **Book Ticket**.
5. **My Tickets**: Check if the ticket appears with a QR code.
6. **Email (Optional)**: If you've configured SMTP in the Notification Service `.env`, check your inbox!
