import type { FormEvent } from "react";
import { useState, useEffect } from "react";
import { Loader, Placeholder } from "@aws-amplify/ui-react";
import "./App.css";
import { Amplify } from "aws-amplify";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import outputs from "../amplify_outputs.json";
import logoImage from "./assets/pics/logo.png";
import { signOut } from "aws-amplify/auth";
import { getCurrentUser } from 'aws-amplify/auth';

import "@aws-amplify/ui-react/styles.css";

Amplify.configure(outputs);

const amplifyClient = generateClient<Schema>({
  authMode: "userPool",
});

function App() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [animateIntro, setAnimateIntro] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Trigger animation after component mounts
    setAnimateIntro(true);
  }, []);

  const callBedrockAPI = async (ingredients: string[]) => {
    // Create a promise that will reject after 30 seconds
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out')), 30000);
    });
    
    try {
      console.log('Calling Bedrock API with cross-region inference, ingredients:', ingredients);
      const response = await Promise.race([
        amplifyClient.queries.askBedrock({ ingredients }),
        timeout
      ]);
      console.log('Received response:', response);
      
      // If we get here, API request completed before timeout
      if (!response.data) {
        throw new Error("No data returned from the API");
      }
      
      // Check if there's an error in the response
      if (response.data.error) {
        console.error('Bedrock API returned error:', response.data.error);
        console.error('Full response:', response);
        throw new Error(response.data.error);
      }
      
      // Check if body is empty or null
      if (!response.data.body) {
        throw new Error("Empty response body from the API");
      }
      
      return response.data.body;
    } catch (error) {
      // Re-throw the error to handle it in the calling function
      throw error;
    }
  };

  const collectUserData = async (ingredients: string) => {
    try {
      const user = await getCurrentUser();
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const dataPayload = {
        ingredients,
        timestamp: new Date().toISOString(),
        userId: user.userId || 'anonymous',
        sessionId
      };
  
      // Replace YOUR_API_GATEWAY_URL with the actual URL from step 15.3
      await fetch('https://d03syfw3fh.execute-api.ap-southeast-1.amazonaws.com/prod/collect-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataPayload)
      });
    } catch (error) {
      // Silently fail - don't disrupt user experience
      console.log('Data collection failed:', error);
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!inputValue.trim()) return;
    
    setLoading(true);
    setResult("");
    setError(null);

    try {
      const ingredientsInput = inputValue.trim();

      // Collect user data (fire and forget)
      collectUserData(ingredientsInput);

      const ingredientsArray = ingredientsInput
        .split(",")
        .map(ingredient => ingredient.trim())
        .filter(ingredient => ingredient.length > 0);
      
      // Use cross-region inference - AWS Bedrock will handle routing automatically
      const resultText = await callBedrockAPI(ingredientsArray);
      setResult(resultText || "No recipe content returned");
      
    } catch (e) {
      console.error("Cross-region inference failed:", e);
      if (e instanceof Error) {
        setError(`Service error: ${e.message}`);
      } else {
        setError("Service is currently unavailable. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // The Authenticator will handle the UI change automatically
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <div className="app-container">
      <div className="nav-container">
        <button className="logout-button" onClick={handleLogout}>
          Log Out
        </button>
      </div>
      
      <div className={`header-container ${animateIntro ? 'fade-in' : ''}`}>
        <img src={logoImage} alt="Recipe AI Logo" className="logo" />
        <h1 className="main-header">
          Do you have some
          <br />
          <span className="highlight">Leftover?</span>
        </h1>
        <p className="description">
          Just type in any ingredients you have left in your fridge or pantry,
          separated by commas. We'll help you create a delicious recipe with what you already have!
          <br />
          <span className="multilingual-note">
            (Our website supports all languages, please input the ingredients in your language)
          </span>
        </p>
      </div>
      
      <form onSubmit={onSubmit} className={`form-container ${animateIntro ? 'slide-up' : ''}`}>
        <div className="search-container">
          <input
            type="text"
            className="wide-input"
            id="ingredients"
            name="ingredients"
            placeholder="Chicken, rice, carrots, onion..."
            value={inputValue}
            onChange={handleInputChange}
          />
          <button 
            type="submit" 
            className="search-button"
            disabled={loading || !inputValue.trim()}
          >
            {loading ? 'Processing...' : 'Generate'}
          </button>
        </div>
      </form>
      
      {(loading || result || error) && (
        <div className={`result-container ${result || loading || error ? 'appear' : ''}`}>
          {loading ? (
            <div className="loader-container">
              <p>Creating your personalized recipe...</p>
              <Loader size="large" />
              <Placeholder size="large" />
              <Placeholder size="large" />
              <Placeholder size="large" />
            </div>
          ) : error ? (
            <p className="result error-message">{error}</p>
          ) : (
            <p className="result">{result}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
