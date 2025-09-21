"use client"

import { useState, useEffect } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { MapPin, Droplets, TrendingDown, TrendingUp, AlertTriangle, RefreshCw, Info, X } from "lucide-react"

// Mock DWLR data - in real app, this would come from API
const generateMockData = () => {
  const stations = [
    { id: "DW001", name: "Station Alpha", lat: 28.7041, lng: 77.1025, district: "Delhi", state: "Delhi" },
    { id: "DW002", name: "Station Beta", lat: 28.5355, lng: 77.391, district: "Gurugram", state: "Haryana" },
    { id: "DW003", name: "Station Gamma", lat: 28.4595, lng: 77.0266, district: "Gurugram", state: "Haryana" },
    { id: "DW004", name: "Station Delta", lat: 28.6139, lng: 77.209, district: "Delhi", state: "Delhi" },
  ]

  const timeSeriesData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return {
      date: date.toISOString().split("T")[0],
      level: 15 + Math.sin(i * 0.2) * 5 + Math.random() * 2,
      rainfall: Math.random() * 50,
      temperature: 25 + Math.random() * 10,
    }
  })

  const alerts = [
    {
      id: "alert-1",
      type: "critical",
      title: "Critical Alert",
      message: "Station Delta: Water level dropped below 8m threshold",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      station: "DW004",
    },
    {
      id: "alert-2",
      type: "warning",
      title: "Warning",
      message: "Station Beta: Declining trend detected over past 7 days",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      station: "DW002",
    },
    {
      id: "alert-3",
      type: "info",
      title: "System Update",
      message: "New data processing algorithm deployed for better accuracy",
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      station: null,
    },
  ]

  return { stations, timeSeriesData, alerts }
}

const GroundwaterApp = () => {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedStation, setSelectedStation] = useState("DW001")
  const [dateRange, setDateRange] = useState("30d")
  const [data, setData] = useState(generateMockData())
  const [loading, setLoading] = useState(false)
  const [dashboardAlerts, setDashboardAlerts] = useState([])
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set())

  useEffect(() => {
    // Show alerts on dashboard when component mounts
    if (activeTab === "dashboard") {
      const newAlerts = data.alerts.filter((alert) => !dismissedAlerts.has(alert.id)).slice(0, 2) // Show max 2 alerts at once

      setDashboardAlerts(newAlerts)

      // Auto-dismiss alerts after 8 seconds
      if (newAlerts.length > 0) {
        const timer = setTimeout(() => {
          setDashboardAlerts([])
        }, 8000)
        return () => clearTimeout(timer)
      }
    }
  }, [activeTab, data.alerts, dismissedAlerts])

  const dismissAlert = (alertId) => {
    setDismissedAlerts((prev) => new Set(prev).add(alertId))
    setDashboardAlerts((prev) => prev.filter((alert) => alert.id !== alertId))
  }

  const refreshData = () => {
    setLoading(true)
    setTimeout(() => {
      setData(generateMockData())
      setLoading(false)
    }, 1000)
  }

  const currentStation = data.stations.find((s) => s.id === selectedStation)
  const currentLevel = data.timeSeriesData[data.timeSeriesData.length - 1]?.level || 0
  const previousLevel = data.timeSeriesData[data.timeSeriesData.length - 7]?.level || 0
  const trend = currentLevel - previousLevel

  const getStatusColor = (level) => {
    if (level > 20) return "text-green-600 bg-green-100"
    if (level > 10) return "text-yellow-600 bg-yellow-100"
    return "text-red-600 bg-red-100"
  }

  const AlertBanner = ({ alert }) => {
    const getAlertStyles = (type) => {
      switch (type) {
        case "critical":
          return "bg-red-50 border-red-200 text-red-800"
        case "warning":
          return "bg-yellow-50 border-yellow-200 text-yellow-800"
        case "info":
          return "bg-blue-50 border-blue-200 text-blue-800"
        default:
          return "bg-gray-50 border-gray-200 text-gray-800"
      }
    }

    const getAlertIcon = (type) => {
      switch (type) {
        case "critical":
        case "warning":
          return <AlertTriangle size={16} className="text-current" />
        case "info":
          return <Info size={16} className="text-current" />
        default:
          return <Info size={16} className="text-current" />
      }
    }

    const formatTimeAgo = (timestamp) => {
      const now = new Date()
      const diff = now - timestamp
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor(diff / (1000 * 60))

      if (hours > 0) return `${hours}h ago`
      if (minutes > 0) return `${minutes}m ago`
      return "Just now"
    }

    return (
      <div className={`border rounded-lg p-3 mb-3 ${getAlertStyles(alert.type)} animate-slide-in`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-2 flex-1">
            {getAlertIcon(alert.type)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">{alert.title}</h4>
                <span className="text-xs opacity-75 ml-2">{formatTimeAgo(alert.timestamp)}</span>
              </div>
              <p className="text-sm opacity-90 mt-1">{alert.message}</p>
            </div>
          </div>
          <button
            onClick={() => dismissAlert(alert.id)}
            className="ml-2 p-1 hover:bg-black hover:bg-opacity-10 rounded-full transition-colors flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    )
  }

  const getStatusText = (level) => {
    if (level > 20) return "Good"
    if (level > 10) return "Moderate"
    return "Critical"
  }

  const stationStats = data.stations.map((station) => ({
    ...station,
    currentLevel: 15 + Math.random() * 15,
    status: Math.random() > 0.3 ? "active" : "inactive",
    lastUpdate: new Date().toLocaleString(),
  }))

  const pieData = [
    { name: "Good", value: 40, color: "#10B981" },
    { name: "Moderate", value: 35, color: "#F59E0B" },
    { name: "Critical", value: 25, color: "#EF4444" },
  ]

  const Navigation = () => (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around">
        {[
          { id: "dashboard", icon: Droplets, label: "Dashboard" },
          { id: "stations", icon: MapPin, label: "Stations" },
          { id: "analytics", icon: TrendingUp, label: "Analytics" },
          { id: "alerts", icon: AlertTriangle, label: "Alerts" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
              activeTab === tab.id ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <tab.icon size={20} />
            <span className="text-xs mt-1">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )

  const Header = () => (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">DWLR Monitor</h1>
          <p className="text-blue-100 text-sm">Real-time Groundwater Evaluation</p>
        </div>
        <button
          onClick={refreshData}
          disabled={loading}
          className="p-2 bg-blue-700 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
    </header>
  )

  const Dashboard = () => (
    <div className="p-4 pb-20 space-y-6">
      {/* Alert Banners */}
      {dashboardAlerts.map((alert) => (
        <AlertBanner key={alert.id} alert={alert} />
      ))}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Current Level</p>
              <p className="text-2xl font-bold">{currentLevel.toFixed(2)}m</p>
            </div>
            <Droplets className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Weekly Trend</p>
              <p className={`text-2xl font-bold ${trend > 0 ? "text-green-600" : "text-red-600"}`}>
                {trend > 0 ? "+" : ""}
                {trend.toFixed(2)}m
              </p>
            </div>
            {trend > 0 ? (
              <TrendingUp className="text-green-500" size={24} />
            ) : (
              <TrendingDown className="text-red-500" size={24} />
            )}
          </div>
        </div>
      </div>

      {/* Station Selector */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <label className="block text-sm font-medium text-gray-700 mb-2">Selected Station</label>
        <select
          value={selectedStation}
          onChange={(e) => setSelectedStation(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {data.stations.map((station) => (
            <option key={station.id} value={station.id}>
              {station.name} - {station.district}
            </option>
          ))}
        </select>
      </div>

      {/* Water Level Chart */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Water Level Trend</h3>
          <div className="flex space-x-2">
            {["7d", "30d", "90d"].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1 rounded-md text-sm ${
                  dateRange === range ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data.timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              labelFormatter={(value) => new Date(value).toLocaleDateString("en-IN")}
              formatter={(value, name) => [`${value.toFixed(2)}m`, "Water Level"]}
            />
            <Line type="monotone" dataKey="level" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Status Card */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-3">Current Status</h3>
        <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentLevel)}`}>
          {getStatusText(currentLevel)} - {currentLevel.toFixed(2)}m
        </div>
        <div className="mt-3 text-sm text-gray-600">
          <p>Station: {currentStation?.name}</p>
          <p>
            Location: {currentStation?.district}, {currentStation?.state}
          </p>
          <p>Last Updated: {new Date().toLocaleString("en-IN")}</p>
        </div>
      </div>
    </div>
  )

  const Stations = () => (
    <div className="p-4 pb-20 space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-3">Station Overview</h3>
        <div className="text-center">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {stationStats.map((station) => (
        <div key={station.id} className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-semibold">{station.name}</h4>
              <p className="text-sm text-gray-600">
                {station.district}, {station.state}
              </p>
            </div>
            <div
              className={`w-3 h-3 rounded-full ${station.status === "active" ? "bg-green-500" : "bg-red-500"}`}
            ></div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <p className="text-xs text-gray-500">Current Level</p>
              <p className="font-semibold">{station.currentLevel.toFixed(2)}m</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <p className={`text-sm font-medium ${getStatusColor(station.currentLevel).split(" ")[0]}`}>
                {getStatusText(station.currentLevel)}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Last Update: {station.lastUpdate}</p>
        </div>
      ))}
    </div>
  )

  const Analytics = () => (
    <div className="p-4 pb-20 space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Rainfall vs Water Level</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data.timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
            />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line yAxisId="left" type="monotone" dataKey="level" stroke="#3B82F6" name="Water Level (m)" />
            <Line yAxisId="right" type="monotone" dataKey="rainfall" stroke="#10B981" name="Rainfall (mm)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Monthly Statistics</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.timeSeriesData.slice(-7)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString("en-IN", { day: "2-digit" })}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="level" fill="#3B82F6" name="Water Level (m)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-3">Key Insights</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <Info className="text-blue-500 mt-1" size={16} />
            <div>
              <p className="text-sm font-medium">Seasonal Trend</p>
              <p className="text-xs text-gray-600">Water levels show typical monsoon recovery pattern</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <TrendingUp className="text-green-500 mt-1" size={16} />
            <div>
              <p className="text-sm font-medium">Recharge Rate</p>
              <p className="text-xs text-gray-600">Average recharge: 2.3mm/day during monsoon</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <AlertTriangle className="text-yellow-500 mt-1" size={16} />
            <div>
              <p className="text-sm font-medium">Prediction</p>
              <p className="text-xs text-gray-600">Water levels may decline by 15% in next quarter</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const Alerts = () => (
    <div className="p-4 pb-20 space-y-4">
      {data.alerts.map((alert) => {
        const getAlertStyles = (type) => {
          switch (type) {
            case "critical":
              return "bg-red-50 border-l-4 border-red-400"
            case "warning":
              return "bg-yellow-50 border-l-4 border-yellow-400"
            case "info":
              return "bg-blue-50 border-l-4 border-blue-400"
            default:
              return "bg-gray-50 border-l-4 border-gray-400"
          }
        }

        const getAlertIcon = (type) => {
          switch (type) {
            case "critical":
            case "warning":
              return (
                <AlertTriangle
                  className={`${type === "critical" ? "text-red-500" : "text-yellow-500"} mr-2`}
                  size={20}
                />
              )
            case "info":
              return <Info className="text-blue-500 mr-2" size={20} />
            default:
              return <Info className="text-gray-500 mr-2" size={20} />
          }
        }

        const formatTimeAgo = (timestamp) => {
          const now = new Date()
          const diff = now - timestamp
          const hours = Math.floor(diff / (1000 * 60 * 60))
          const days = Math.floor(hours / 24)

          if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`
          if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`
          return "Just now"
        }

        return (
          <div key={alert.id} className={`${getAlertStyles(alert.type)} p-4 rounded-lg`}>
            <div className="flex items-center">
              {getAlertIcon(alert.type)}
              <h4
                className={`${alert.type === "critical" ? "text-red-800" : alert.type === "warning" ? "text-yellow-800" : "text-blue-800"} font-semibold`}
              >
                {alert.title}
              </h4>
            </div>
            <p
              className={`${alert.type === "critical" ? "text-red-700" : alert.type === "warning" ? "text-yellow-700" : "text-blue-700"} text-sm mt-1`}
            >
              {alert.message}
            </p>
            <p
              className={`${alert.type === "critical" ? "text-red-600" : alert.type === "warning" ? "text-yellow-600" : "text-blue-600"} text-xs mt-2`}
            >
              {formatTimeAgo(alert.timestamp)}
            </p>
          </div>
        )
      })}

      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-3">Alert Settings</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Critical Level Alerts</span>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Daily Reports</span>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Maintenance Notifications</span>
            <input type="checkbox" className="rounded" />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Show Alerts on Dashboard</span>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />
      case "stations":
        return <Stations />
      case "analytics":
        return <Analytics />
      case "alerts":
        return <Alerts />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateY(-10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
      <Header />
      {renderContent()}
      <Navigation />
    </div>
  )
}

export default GroundwaterApp
