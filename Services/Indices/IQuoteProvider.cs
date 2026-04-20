using IndexSwingRadar.Models;

namespace IndexSwingRadar.Services.Indices;

public interface IQuoteProvider
{
    Task<StockRecord?> FetchAsync(
        StockSymbol symbol,
        DateTime startDate,
        DateTime endDate,
        CancellationToken ct = default);
}
