// Monthly OHLC cannot establish a departure followed by a return to Open.
function historicalHsh(current, previous) {
  return {
    diffFromOpen: Math.abs(current.close - current.open),
    closeBetweenOpens: current.close >= Math.min(current.open, previous.open)
      && current.close <= Math.max(current.open, previous.open),
    isRevertedToOpen: null,
    sequenceStatus: 'UNVERIFIED',
  };
}
function clarifyHistoricalDataset(dataset) {
  dataset.candles = dataset.candles.map((c, i, rows) => ({
    ...c, hsh: historicalHsh(c, rows[i - 1] || c),
  }));
  dataset.summary = {...dataset.summary,
    jikaUpPercentMeaning: 'Proporsi klasifikasi JIKA UP; bukan tingkat keberhasilan prediksi.',
    predictionWinRate: null, statisticalValidation: 'NOT_VALIDATED'};
  return dataset;
}
module.exports = {historicalHsh, clarifyHistoricalDataset};
