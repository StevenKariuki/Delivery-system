# Delivery System

## Overview
The **Delivery System** is a web-based application designed to streamline the process of ordering and delivering food efficiently. This project leverages **Node.js**, **Express**, and **MySQL** for the backend while the frontend is under development.

## Features
- User authentication & authorization
- Order management system
- Real-time order tracking
- Secure payment integration (planned)
- Admin dashboard for managing deliveries

## Installation

### Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/)
- [MySQL](https://www.mysql.com/)
- Git

### Setup
1. **Clone the repository**  
   ```sh
   git clone https://github.com/StevenKariuki/Delivery-system.git
   cd Delivery-system
   ```

2. **Install dependencies**  
   ```sh
   npm install
   ```

3. **Set up environment variables**  
   Create a `.env` file in the root directory and add your database credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_NAME=food_delivery_system
   ```

4. **Run database migrations (if applicable)**  
   ```sh
   npm run migrate
   ```

5. **Start the server**  
   ```sh
   npm start
   ```
   The server should now be running at `http://localhost:3000`.

## Git Workflow

### Committing Changes via Terminal in VS Code

1. **Open Terminal**  
   Use `Ctrl + `` (backtick) to open the terminal.

2. **Check the status of your changes**  
   ```sh
   git status
   ```

3. **Stage the changes**  
   - To stage all changes:  
     ```sh
     git add .
     ```
   - To stage a specific file:  
     ```sh
     git add filename.ext
     ```

4. **Commit changes with a meaningful message**  
   ```sh
   git commit -m "Your commit message here"
   ```

5. **Push to GitHub**  
   ```sh
   git push origin main
   ```
   *(Replace `main` with the correct branch name if necessary.)*

## Contributing
Contributions are welcome! To contribute:
1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -m "Add new feature"`)
4. Push to your branch (`git push origin feature-branch`)
5. Open a Pull Request

## License
This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

## Contact
For inquiries or collaboration, feel free to reach out:  
📧 **Email:** stevenkariuki@example.com  
🔗 **GitHub:** [StevenKariuki](https://github.com/StevenKariuki)

---
*Project maintained by [Steven Kariuki](https://github.com/StevenKariuki).*
