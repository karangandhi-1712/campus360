import sys
import joblib
import pandas as pd
import os
cgpa = float(sys.argv[1])
dsa = int(sys.argv[2])
java = int(sys.argv[3])
ml = int(sys.argv[4])
web = int(sys.argv[5])
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model = joblib.load(os.path.join(BASE_DIR, "career_model.pkl"))

df = pd.DataFrame([[cgpa,dsa,java,ml,web]],
                  columns=['cgpa','dsa','java','ml','web'])

prediction = model.predict(df)[0]
confidence = max(model.predict_proba(df)[0]) * 100

print(prediction, round(confidence,2))
