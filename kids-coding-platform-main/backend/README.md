# Kids Coding Platform - Backend

## Overview
The Kids Coding Platform backend is designed to support a fun, interactive, and educational environment for children aged 4-15 to learn coding. This backend serves as the API layer for the application, handling user registration, game management, and progress tracking.

## Directory Structure
- **src/controllers**: Contains controller files that manage the business logic for different routes.
- **src/models**: Defines data structures and schemas for the database, including user profiles, games, and progress records.
- **src/routes**: Maps HTTP requests to the appropriate controller functions, defining the API endpoints.
- **src/index.ts**: Entry point for the backend application, initializing the server and connecting to the database.

## Setup Instructions

### Prerequisites
- Node.js (version 14 or higher)
- npm (Node Package Manager)

### Installation
1. Clone the repository:
   ```
   git clone https://github.com/your-repo/kids-coding-platform.git
   ```
2. Navigate to the backend directory:
   ```
   cd kids-coding-platform/backend
   ```
3. Install the dependencies:
   ```
   npm install
   ```

### Running the Application
To start the backend server, run:
```
npm start
```
The server will be available at `http://localhost:3000`.

## API Usage
The backend provides several API endpoints for the frontend application. Refer to the individual route files in the `src/routes` directory for detailed documentation on each endpoint.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.