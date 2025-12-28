from ..app.ml.SentimentAnalyzer import SentimentAnalyzer

def test_finbert_smoke():
    analyzer = SentimentAnalyzer()

    text = "Manta is dropping by 30%, traders are panicking"
    result = analyzer.analyze([text])

    assert isinstance(result, list)
    assert "label" in result[0]
    assert "score" in result[0]

    print(result)


test_finbert_smoke()
# python -m backend.tests.test_finbert
