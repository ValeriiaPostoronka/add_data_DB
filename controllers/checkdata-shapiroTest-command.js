const config = require('config');
const db = require(`${config.get('Path.utils')}database.js`);

const normalInverse = (x) => {
	const a1 = -3.969683028665376e+1;
	const a2 = 2.209460984245205e+2;
	const a3 = -2.759285104469687e+2;
	const a4 = 1.383577518672690e+2;
	const a5 = -3.066479806614716e+1;
	const a6 = 2.506628277459239e+0;

	const b1 = -5.447609879822406e+1;
	const b2 = 1.615858368580409e+2;
	const b3 = -1.556989798598866e+2;
	const b4 = 6.680131188771972e+1;
	const b5 = -1.328068155288572e+1;

	const c1 = -7.784894002430293e-3;
	const c2 = -3.223964580411365e-1;
	const c3 = -2.400758277161838e+0;
	const c4 = -2.549732539343734e+0;
	const c5 = 4.374664141464968e+0;
	const c6 = 2.938163982698783e+0;

	const d1 = 7.784695709041462e-3;
	const d2 = 3.224671290700398e-1;
	const d3 = 2.445134137142996e+0;
	const d4 = 3.754408661907416e+0;

	let q, r, y;

	if (x < 0.02425) {
		q = Math.sqrt(-2 * Math.log(x));
		y = (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
	} else if (x < 1 - 0.02425) {
		q = x - 0.5;
		r = q * q;
		y = (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q / (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
	} else {
		q = Math.sqrt(-2 * Math.log(1 - x));
		y = -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
	}

	return y;
};

const shapiroWilkTest = (data) => {
  let result = {};
	const xx = data.sort((a, b) => a - b);
	const meanValue = data.reduce((a, b) => a + b) / data.length;
	const n = data.length;
	const u = 1 / Math.sqrt(n);

	const m = new Array();
	for (let i = 1; i <= n; i++) {
		m.push(normalInverse((i - 3/8) / (n + 1/4)));
	}

	const md = m.reduce((sum, value) => sum + Math.pow(value, 2), 0);
  const factor = 1 / Math.sqrt(md);
	const c = m.map((value) => value * factor);

	const an = -2.706056 * Math.pow(u, 5) + 4.434685 * Math.pow(u, 4) - 2.071190 * Math.pow(u, 3) - 0.147981 * Math.pow(u, 2) + 0.221157 * u + c[n - 1];
	const ann = -3.582633 * Math.pow(u, 5) + 5.682633 * Math.pow(u, 4) - 1.752461 * Math.pow(u, 3) - 0.293762 * Math.pow(u, 2) + 0.042981 * u + c[n - 2];

	let phi;


	if (n > 5) {
    let denominator = 1 - 2 * Math.pow(an, 2) - 2 * Math.pow(ann, 2);

    if (denominator === 0) {
        console.error("Знаменник дорівнює нулю!");
    } else {
        phi = (md - 2 * Math.pow(m[n - 1], 2) - 2 * Math.pow(m[n - 2], 2)) / denominator;
    }
	} else {
		phi = (md - 2 * Math.pow(m[n - 1], 2)) / (1 - 2 * Math.pow(an, 2));
	}

	const a = new Array();
	if (n > 5) {
		a.push(-an);
		a.push(-ann);

		for (let i = 2; i < n - 2; i++) {
			a.push(m[i] * Math.pow(phi, -1/2));
		}		

		a.push(ann);
		a.push(an);
	} 
  else {
		a.push(-an);

		for (let i = 1; i < n - 1; i++) {
			a.push(m[i] * Math.pow(phi, -1/2));
		}		

		a.push(an);
	}
  
  let denominator = xx.reduce((sum, value) => sum + Math.pow(value - meanValue, 2), 0);
	result.w = Math.pow(a.map((aValue, index) => aValue * xx[index]).reduce((sum, value) => sum + value), 2) / denominator;

  let g, mu, sigma;

	if (n < 12) {
		let gamma = 0.459 * n - 2.273;
		g = - Math.log(gamma - Math.log(1 - result.w));
		mu = -0.0006714 * Math.pow(n, 3) + 0.025054 * Math.pow(n, 2) - 0.39978 * n + 0.5440;
		sigma = Math.exp(-0.0020322 * Math.pow(n, 3) + 0.062767 * Math.pow(n, 2) - 0.77857 * n + 1.3822);
	} else {
		let u = Math.log(n);
		g = Math.log(1 - result.w);
		mu = 0.0038915 * Math.pow(u, 3) - 0.083751 * Math.pow(u, 2) - 0.31082 * u - 1.5851;
		sigma = Math.exp(0.0030302 * Math.pow(u, 2) - 0.082676 * u - 0.4803);
	}

	const z = (g - mu) / sigma;
	result.p = 1 - 0.5 * (1 + erf(z  / Math.sqrt(2)));

	return result;
}

const erf = (z) => {
	let term;
	let sum = 0;
	let n = 0;
	do {
		term = Math.pow(-1, n) * Math.pow(z, 2 * n + 1) / calculateFactorial(n) / (2 * n + 1);
		sum = sum + term;
		n++;
	} while (Math.abs(term) > 0.000000000001);
	return sum * 2 / Math.sqrt(Math.PI);
};

const calculateFactorial = (n) => {
	let result = 1;

	for (let i = 2; i <= n; i++) {
		result = result * i;
	}

	return result;
}

db.startConnection();

const getIrradianceStatsForDay = async (day) => {
  const query = `
    SELECT 
        "Irradiance"
    FROM 
        pvgis_api 
    WHERE 
        "Day" = $1 AND
        "Irradiance" <> 0
  `;
    
  const result = await db.getColumn(query, [day]);
  return result.map(row => parseFloat(row.Irradiance));
}

const comparePandAlpha = (alpha, p) => {
  return p > alpha;
};

// main part

(async () => {
  const day = process.argv[2];  
  const stats = await getIrradianceStatsForDay(day);

  const shapiroWilkResult = shapiroWilkTest(stats);
  console.log(`W: ${shapiroWilkResult.w}`);
  console.log(`p: ${shapiroWilkResult.p}`);

  const alpha = process.argv[3];
  
  if (comparePandAlpha(alpha, shapiroWilkResult.p)) {
    console.log(`Дані за ${day} день нормально розподілені.`);
  }
  else {
    console.log(`Нормальність даних з очікуванням похибки в ${alpha} не приймається за ${day} день.`);
  }

  db.endConnection();
})();
