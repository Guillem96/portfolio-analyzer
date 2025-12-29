package sells

import (
	"fmt"

	"github.com/Guillem96/portfolio-analyzer-server/internal/domain"
	"github.com/judedaryl/go-arrayutils"
)

func ComputeFIFORuleAvgPurchasePrice(buys domain.Buys, sells domain.Sells, reinvestmentsAsFree bool) (float32, error) {
	buys = arrayutils.Map(buys, func(b domain.BuyWithId) domain.BuyWithId {
		if !reinvestmentsAsFree || !b.Buy.IsReinvestment {
			return b
		}
		return domain.BuyWithId{
			Id: b.Id,
			Buy: domain.Buy{
				Units:          b.Buy.Units,
				Amount:         0,
				Fee:            b.Buy.Fee,
				Taxes:          b.Buy.Taxes,
				Ticker:         b.Buy.Ticker,
				Currency:       b.Buy.Currency,
				IsReinvestment: b.Buy.IsReinvestment,
				Date:           b.Buy.Date,
			},
		}
	})
	totalUnits := arrayutils.Reduce(buys, 0, func(agg float32, b domain.BuyWithId) float32 {
		return agg + b.Buy.Units
	})
	soldUnits := arrayutils.Reduce(sells, 0, func(agg float32, s domain.SellWithId) float32 {
		return agg + s.Sell.Units
	})
	buyValue := arrayutils.Reduce(buys, 0, func(agg float32, b domain.BuyWithId) float32 {
		return agg + b.Buy.Amount + b.Buy.Fee + b.Buy.Taxes
	})

	if soldUnits == 0 {
		return buyValue / totalUnits, nil
	}

	// Get all buy packets for example if in the past I did 4 purchases of 100 shares
	// here I'll get [100, 100, 100, 100]
	packetsRemaining := arrayutils.Map(buys, func(b domain.BuyWithId) float32 {
		return b.Buy.Units
	})
	fmt.Println("packetsRemaining", packetsRemaining)
	// In this loop we clear the already sold packets. For example, if in the past I sold 150 units
	// the state after this loop will be
	// packetsRemaining := [0, 50, 100, 100]
	i := 0
	for soldUnits > 0 {
		packet := packetsRemaining[i]
		if packet <= soldUnits {
			packetsRemaining[i] = 0
			soldUnits -= packet
			i++
		} else {
			packetsRemaining[i] -= soldUnits
			soldUnits = 0
			break
		}
	}
	fmt.Println("packetsRemaining", packetsRemaining)
	totalRemainingUnits := arrayutils.Reduce(packetsRemaining[i:], 0, func(agg float32, p float32) float32 {
		return agg + p
	})
	fmt.Println("totalRemainingUnits", totalRemainingUnits)
	// Here starting from the startingPackageIndex (i) we obtain the weighted cost of the purchases
	weightedSum := 0.0
	fmt.Println("i", i)
	for j := i; j < len(buys); j++ {
		currentBuy := buys[j]
		currentBuyRemainingUnits := packetsRemaining[j]
		packetUnitValue := float64(currentBuy.Buy.Amount+currentBuy.Buy.Fee+currentBuy.Buy.Taxes) / float64(currentBuy.Buy.Units)
		weightedSum += float64(currentBuyRemainingUnits) * packetUnitValue
	}

	return float32(weightedSum) / float32(totalRemainingUnits), nil
}
