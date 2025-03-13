# K6 Performance Testing Project - Documentation

## ✨ Overview
This project is a **performance testing suite** using [Grafana K6](https://k6.io/). It enables developers to test APIs under various loads, including **smoke, baseline, load, stress, soak, endurance, and spike testing**.

### **Key Features**
- Simulates different types of traffic patterns
- Sends performance logs to **Grafana Cloud & Loki**
- Supports **Docker & Docker Compose**
- Uses **modular configurations** for easy customization

---

## 🔮 Project Structure
```
/K6-Automation
│── docker-compose.yml         # Docker Compose setup for K6
│── .env                       # Environment variables
│── performance_test.js        # Main K6 test script
│── configurations.js          # Load testing configurations

```

---

## 🚀 Prerequisites
Before running the project, ensure you have:
- **Docker & Docker Compose** installed
- **Grafana Cloud account** (if using cloud logging)
- **K6 installed (optional for local runs)**

## To install K6 locally: (Optional)
```sh
brew install k6  # MacOS
choco install k6  # Windows
sudo apt install k6  # Linux
```


## 🛠️ Running K6 Locally (Optional)
If you want to run K6 **without Docker**, use:
```sh
k6 run performance_test.js -o cloud
```
> Requires K6 to be installed locally.

---

## 🛠️ Setup Instructions
### **1. Clone the Repository**
```sh
git clone https://github.com/Tarequzzaman/K6-Automation.git
cd K6-Automation
```

### **2. Configure Environment Variables**
Create a `.env` file in the project root and add:
```
GRAFANA_CLOUD_TOKEN=your_grafana_cloud_token
BASE_URL=https://your-api-endpoint.com
LOKI_URL=https://logs-prod-xyz.grafana.net
```
> **Note:** If using a **self-hosted Loki**, replace `LOKI_URL` with `http://loki:3100`.

---

## 🏃️ Running the Tests
### **Running the Performance Test via Docker Compose**
To start the test using Docker Compose:
```sh
docker compose up --build
```
> This will run the test and send logs to **Grafana Cloud Loki**.

To stop the test:
```sh
docker compose down
```

---

## 💪 Available Test Scenarios
The project supports multiple test scenarios:

| Test Type | Description |
|-----------|------------|
| **Smoke Test** | Quick test with minimal load |
| **Baseline Test** | Runs a moderate load test for 10 minutes |
| **Load Test** | Simulates users gradually increasing & decreasing |
| **Stress Test** | Pushes the API to its limits |
| **Soak Test** | Tests long-duration performance impact |
| **Endurance Test** | Extended duration test with a steady load |
| **Spike Test** | Sudden surge in traffic to check system stability |

---

## 👁️ Viewing Logs in Grafana
After running the test, you can view **real-time logs & metrics** in **Grafana Loki**.

### **How to Access Logs in Grafana**
1. Open **Grafana Dashboard**
2. Navigate to **Explore**
3. Select **Loki** as the data source
4. Run the following LogQL query:
   ```logql
   {container_name="k6-performance-test"}
   ```
5. View performance logs for each request.

---

## 🎉 Conclusion
This K6 automation framework helps developers **stress-test APIs**, analyze performance metrics, and visualize logs in **Grafana Cloud Loki**. 🚀  
