# 🌉 Unibridge

UniBridge is a full-stack web application designed to help university students connect with each other for **social, academic, and fitness activities**. Whether it’s finding a study buddy, joining a society session, scheduling a gym partner, or forming a sports team, UniBridge makes it simple to meet like-minded students.

---

## ✨ Features

- 🎯 **Activity Matching**  
  Match with other students based on interests and activities. Users swipe to match or reject profiles, with matches suggested based on gym preferences, sports interests, study habits, and availability.
  
- ➕ **Activity Management**  
  Create, browse, and join activities such as study groups, sports events, and society socials.
  
- 👥 **Friends List & Chat**  
  Add friends and communicate directly with built-in messaging.  

- 🏆 **Challenges & Rankings**  
  Compete with friends on challenges and track progress on leaderboards.  

- 📅 **Bookings**  
  Reserve spots for events, manage room bookings, and track schedules.

---

## 🎥 Demo

Here’s a walkthrough of UniBridge:  
[▶️ Watch the full demo (8 min)](https://drive.google.com/file/d/1EsQtj2pa3zs9j6kB8tFULylyM4YSesta/view?usp=sharing)

### Screenshots

- **Home Page (my design)**
  ![Home](src/app_screenshots/SS1.png)

- **Activity Matching (my feature)**
  ![Matching Page](src/app_screenshots/SS3.png)
  ![Match Requests Page](src/app_screenshots/SS5.png)
  ![Upcoming Matches Page](src/app_screenshots/SS6.png)

- **Profile**
  ![Profile](src/app_screenshots/SS4.png)

---

## 👥 Contributors

| Name                          | Main Contribution(s)                                   |
|-------------------------------|--------------------------------------------------------|
| **Muhammed Nawfal Fareed Jaman** | Activity Matching                                   |
| Rohit Mamtora                 | Profile creation and setup                            |
| Eashan Nirav Nair             | Chat & Messaging                                       |
| Hasaan Afroze                 | Friends List                                           |
| Ou Kai Ying                   | Bookings                                               |
| Aarij Khan                    | Activity Management                                    |
| Dorian Alsop                  | Rankings and Reviews                                   |
| Saw Yin Rui                   | Challenges                                             |

## 🔎 My Contribution

I was responsible for the design and implementation of the **Activity Matching** feature, which is the central part of UniBridge. This included both backend logic and frontend UI:

**Backend (Spring Boot & PostgreSQL)**  
- Implemented the `ActivityMatch` entity with supporting **repository, service, and resource classes** to manage match requests and status updates.  
- Wrote an **SQL query** that used profile attributes (gym skill level, preferred gym/study times, course, sports interests,etc.) to generate match suggestions.  
- Added **backend constraints**, including a rejection timeout so declined profiles reappear only after 2 weeks.   
- Extended **security configuration** so that only logged-in users could create matches.

**Frontend (Angular)**  
- Built a Tinder-style swipe interface for accepting/rejecting profiles.  
- Developed the **Match Requests** page to view incoming match requests and the **Upcoming Matches** page, where users can view scheduled matches.

**Accessibility Feature**
- Implemented a **text-to-speech** accessibility feature, allowing visually impaired users to hover over buttons or click a page-level reader to have on-screen content spoken aloud.

**Others**  
- Contributed to shared frontend components such as the **home page and navigation bar**.  

---

## 🛠️ Tech Stack

- ☕ **Java** – Backend language  
- 🌱 **Spring Boot** – REST APIs and business logic  
- 🐘 **PostgreSQL** – Database
- 🅰️ **Angular** – Frontend framework (TypeScript, HTML, CSS, Bootstrap)  
- 📦 **Docker** – Containerization and deployment  
- ⚡ **JHipster** – Project scaffolding and configuration  

---

## ⚡ Getting Started

### 🔧 Prerequisites
- Java 21  
- Node.js 20 (LTS)  
- Docker  

### ▶️ Run Locally

**Backend (Spring Boot)**
Run in terminal: 

```
./mvnw
```

Back-end runs at `http://localhost:8080`

**Frontend (Angular)**
Run in terminal: 

```
npm start
```
Front-end runs at `http://localhost:9000`
