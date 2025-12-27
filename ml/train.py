import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib

# Load dataset
data = pd.read_csv("career_data.csv")

X = data[['cgpa','dsa','java','ml','web']]
y = data['career']

# Train model
model = RandomForestClassifier()
model.fit(X, y)

# Save model
joblib.dump(model, "career_model.pkl")

print("Model trained & saved")
