from fastapi import HTTPException, UploadFile
import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder
import io

class UploadHandler:
    def __init__(self, uploaded_datasets: dict):
        self.uploaded_datasets = uploaded_datasets

    async def handle(self, file: UploadFile):
        try:
            if not file.filename.endswith(".csv"):
                raise HTTPException(status_code=400, detail="Only CSV files are allowed")

            contents = await file.read()

            encodings = ["utf-8", "latin-1", "iso-8859-1", "cp1252", "ascii"]
            df = None

            for encoding in encodings:
                try:
                    df = pd.read_csv(io.StringIO(contents.decode(encoding)))
                    break
                except (UnicodeDecodeError, UnicodeError):
                    continue

            if df is None:
                raise HTTPException(
                    status_code=400,
                    detail="Could not decode CSV file. Try saving with UTF-8 encoding.",
                )

            if df.shape[1] < 2:
                raise HTTPException(
                    status_code=400,
                    detail="Dataset must have at least 2 columns (features + target)",
                )

            dataset_id = file.filename.rsplit(".", 1)[0]

            X_df = df.iloc[:, :-1].copy()
            y = df.iloc[:, -1].values

            for col in X_df.columns:
                if X_df[col].dtype in ("object", "string"):
                    le = LabelEncoder()
                    X_df[col] = le.fit_transform(X_df[col].astype(str))

            try:
                X = X_df.values.astype(float)
            except ValueError as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"Could not convert features to numbers: {str(e)}",
                )

            try:
                y = pd.to_numeric(y)
            except Exception:
                print("   Converting target column to numeric...")
                le = LabelEncoder()
                y = le.fit_transform(y.astype(str))

            self.uploaded_datasets[dataset_id] = (X, y)

            return {
                "dataset_id": dataset_id,
                "message": "Dataset uploaded successfully",
                "shape": list(X.shape),
                "num_classes": int(len(np.unique(y))),
            }

        except HTTPException:
            raise
        except Exception as e:
            print(f"Error processing dataset: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error processing dataset: {str(e)}")