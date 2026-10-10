import pytest
from app.ai.forecast_model import DemandForecaster
import pandas as pd
import numpy as np

def test_forecast_model_training():
    forecaster = DemandForecaster()
    
    # Synthetic data
    dates = pd.date_range('2023-01-01', periods=100, freq='H')
    df = pd.DataFrame({
        'timestamp': dates,
        'historical_count': np.random.randint(10, 100, 100),
        'event_flag': np.random.randint(0, 2, 100),
        'weather_temp': np.random.uniform(15.0, 35.0, 100),
        'target_demand': np.random.randint(20, 120, 100)
    })
    
    metrics = forecaster.train(df, 'target_demand')
    
    assert forecaster.is_trained == True
    assert 'mae' in metrics
    assert 'rmse' in metrics
    
    # Test prediction
    future_df = df.copy().tail(10)
    results = forecaster.forecast(future_df)
    
    assert len(results['predictions']) == 10
    assert len(results['confidence_low']) == 10
    assert len(results['confidence_high']) == 10
