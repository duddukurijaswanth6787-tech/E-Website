# Vasanthi Creations - Setup & Run Guide

To run this project on another laptop, follow these steps:

## Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: v18 or higher
- **MongoDB**: A local instance or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection string.
- **Redis**: Required for OTP and Caching. If you don't have it installed, you can leave it empty in `.env` to fallback to in-memory (if the code supports it) or install it via Docker/WSL.
- **Git**: To clone the repository.

---

## 1. Clone the Project
```bash
git clone https://github.com/duddukurijaswanth6787-tech/E-Website.git
cd E-Website
```

## 2. Backend Configuration
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Setup Environment Variables:
   - Create a `.env` file by copying `.env.example`:
     ```bash
     cp .env.example .env
     ```
   - Update the following in `.env`:
     - `MONGO_URI`: Your MongoDB connection string.
     - `REDIS_URL`: Your Redis URL (e.g., `redis://localhost:6379`).
     - `JWT_ACCESS_SECRET` & `JWT_REFRESH_SECRET`: Put any random long strings.
     - `SMTP_*`: Configure your Gmail App Password if you want to send emails.
     - `RAZORPAY_*`: Your Razorpay Test Keys (if using payments).
     - `SEED_ADMIN_PASSWORD`: Set a password for the initial admin.

4. Seed the Database (Optional - Creates Initial Admin):
   ```bash
   npm run seed
   ```

5. Start Backend:
   ```bash
   npm run dev
   ```

## 3. Frontend Configuration
1. Open a new terminal and navigate to the `Frontend` folder:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Setup Environment Variables:
   - Create a `.env` file:
     ```bash
     cp .env.example .env
     ```
   - *Note: If .env.example doesn't exist, create a .env with:*
     ```env
     VITE_API_URL=http://localhost:5000/api/v1
     VITE_RAZORPAY_KEY_ID=your_razorpay_test_key
     ```

4. Start Frontend:
   ```bash
   npm run dev
   ```

---

## 4. Access the Portals
- **Client Storefront**: `http://localhost:5173`
- **Admin Command Center**: `http://localhost:5173/admin`
- **Manager Ops Portal**: `http://localhost:5173/manager/login`
- **Tailor Production Feed**: `http://localhost:5173/tailor/login`

---

## 5. Development Tips
- **Production Event Logs**: Check `backend/logs` for detailed operational audits.
- **Realtime Feed**: Ensure you have multiple browser tabs open to test the Socket.IO notification synchronization.
- **Measurement Engine**: Test the premium measurement engine by creating a new custom blouse request from the storefront.

---

## Project Structure
- **/Frontend**: High-end React SPA with specialized portals for Admin, Managers, and Tailors.
- **/backend**: Industrial-grade Node.js API with domain-driven notification bridge and real-time event bus.
- **/docker-compose.yml**: Orchestration for rapid deployment including MongoDB.
