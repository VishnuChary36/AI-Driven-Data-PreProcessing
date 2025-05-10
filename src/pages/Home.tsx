import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 text-center bg-white text-gray-800">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">Data Preprocess Tool</h1>
      <p className="text-lg text-gray-600 mb-10">
        Transform your raw data into analysis-ready datasets with our powerful preprocessing tool
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        <div className="p-6 border border-gray-300 rounded-lg shadow-md flex items-center bg-gray-100 hover:shadow-lg transition-shadow">
          <img
            src="static/Handle-Missing.png"
            alt="Handle Missing Values Icon"
            className="h-40 w-40 mr-6" // Increased size and added margin-right
          />
          <div>
            <h2 className="text-2xl font-semibold mb-2 text-gray-800">Handle Missing Values</h2>
            <p className="text-gray-600">Drop them or fill them using mean, median, or mode</p>
          </div>
        </div>
        <div className="p-6 border border-gray-300 rounded-lg shadow-md flex items-center bg-gray-100 hover:shadow-lg transition-shadow">
          <img
            src="static/Clean-Outliers.png"
            alt="Clean Outliers Icon"
            className="h-40 w-40 mr-6" // Increased size and added margin-right
          />
          <div>
            <h2 className="text-2xl font-semibold mb-2 text-gray-800">Clean Outliers</h2>
            <p className="text-gray-600">Identify and manage outliers using IQR or Z-score methods</p>
          </div>
        </div>
        <div className="p-6 border border-gray-300 rounded-lg shadow-md flex items-center bg-gray-100 hover:shadow-lg transition-shadow">
          <img
            src="static/Feature-Scaling.png"
            alt="Feature Scaling Icon"
            className="h-40 w-40 mr-6" // Increased size and added margin-right
          />
          <div>
            <h2 className="text-2xl font-semibold mb-2 text-gray-800">Feature Scaling</h2>
            <p className="text-gray-600">Standardize or normalize your numeric features</p>
          </div>
        </div>
        <div className="p-6 border border-gray-300 rounded-lg shadow-md flex items-center bg-gray-100 hover:shadow-lg transition-shadow">
          <img
            src="static/Categorical-Encoding.png"
            alt="Encode Categorical Data Icon"
            className="h-40 w-40 mr-6" // Increased size and added margin-right
          />
          <div>
            <h2 className="text-2xl font-semibold mb-2 text-gray-800">Encode Categorical Data</h2>
            <p className="text-gray-600">Convert text categories to numerical values</p>
          </div>
        </div>
      </div>
      <Button
        className="bg-blue-600 text-white px-6 py-6 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all transform hover:-translate-y-1"
        onClick={() => navigate("/upload")}
      >
        Get Started →
      </Button>
    </div>
  );
};

export default Home;