from typing import List

class SentimentAnalyzer:
  _instance = None
  _pipe = None

  def __new__(cls):
    if cls._instance is None:
      cls._instance = super().__new__(cls)
    return cls._instance

  def load_model(self):
    if self._pipe is None:
      from transformers import pipeline
      self._pipe = pipeline(
        "text-classification",
        model="ProsusAI/finbert"
      )
    return self._pipe

  def analyze(self, texts: List[str]):
    pipe = self.load_model()
    return pipe(
      texts,
      truncation = True,
      max_length = 256,
      batch_size=8
    )
