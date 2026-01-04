from typing import List, Union

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

  def analyze(self, texts: Union[str, List[str]]):
    """
    Analyze sentiment of text(s).

    Args:
        texts: Single text string or list of texts

    Returns:
        Single result dict or list of result dicts
    """
    pipe = self.load_model()

    # Handle single string input
    is_single = isinstance(texts, str)
    if is_single:
      texts = [texts]

    results = pipe(
      texts,
      truncation=True,
      max_length=256,
      batch_size=16
    )

    # Return single result if input was single string
    return results[0] if is_single else results
