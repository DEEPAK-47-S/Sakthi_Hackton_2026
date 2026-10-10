from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error
import pandas as pd
import numpy as np

class DemandForecaster:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.is_trained = False
        
    def extract_features(self, df):
        # Assumes df has 'timestamp', 'historical_count', 'event_flag', 'weather_temp'
        df['hour'] = pd.to_datetime(df['timestamp']).dt.hour
        df['dayofweek'] = pd.to_datetime(df['timestamp']).dt.dayofweek
        df['is_weekend'] = df['dayofweek'].isin([5, 6]).astype(int)
        return df[['hour', 'dayofweek', 'is_weekend', 'historical_count', 'event_flag', 'weather_temp']]
        
    def train(self, historical_df, target_col):
        X = self.extract_features(historical_df)
        y = historical_df[target_col]
        self.model.fit(X, y)
        self.is_trained = True
        
        # Evaluate on training data for baseline metrics
        preds = self.model.predict(X)
        mae = mean_absolute_error(y, preds)
        rmse = np.sqrt(mean_squared_error(y, preds))
        
        return {'mae': mae, 'rmse': rmse}
        
    def forecast(self, future_df):
        if not self.is_trained:
            raise ValueError("Model must be trained before forecasting.")
        X_future = self.extract_features(future_df)
        predictions = self.model.predict(X_future)
        
        # Add basic confidence intervals for demo
        intervals_low = predictions * 0.8
        intervals_high = predictions * 1.2
        
        return {
            'predictions': predictions,
            'confidence_low': intervals_low,
            'confidence_high': intervals_high
        }
