from transformers import pipeline
from typing import List

class SentimentAnalyzer:
  def __init__(self):
    self.pipe = pipeline(
      "text-classification",
      model="ProsusAI/finbert"
    )

  def analyze(self, texts: List[str]):
    return self.pipe(
      texts,
      truncation = True,
      max_length = 256,
      batch_size=8
    )
