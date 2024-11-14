class plot2Dmask {
  margin;
  width;
  height;

  x;
  y;

  svg;

  constructor() {
    this.d3 = null;
    this.JSDOM;
  }

  init = async (width = 1200, height = 500, margin = {top: 50, right: 50, bottom: 60, left: 50}) => {
    try {
      this.d3 = await import('d3');
      const { JSDOM } = await import('jsdom');
      this.JSDOM = JSDOM;
    } catch (error) {
      console.error('Failed to load module:', error);
    }

    this.dom = new this.JSDOM('<!DOCTYPE html><html><body></body></html>');

    this.#setSizeProps(width, height, margin);

    this.svg = this.d3.select(this.dom.window.document)
      .select('body')
      .append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .attr("xmlns", "http://www.w3.org/2000/svg")
      .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
      .append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);
  }

  #setSizeProps = (width, height, margin) => {
    this.margin = margin;
    this.width = width - margin.left - margin.right;
    this.height = height - margin.top - margin.bottom;
  }
}

class timePlot2D {
  _fs = require('fs');
  _config = require('config');
  _plot;
  _dataset;
  xlabel;
  ylabel;

  svgTag;

  timeFormats = { // Нормально використати часові формати
    daily : "%d %b, %H:%M", // 01 Jan, 00:01
    monthly : "%b %d day", // Jan 01 day
    yearly : "%d %b %Y" //  01 Jan 2020
  }

  constructor(dataset) {
    this._plot = new plot2Dmask();
    this._dataset = dataset;
  }

  init = async (width, height, margin, xlabel, ylabel) => {
    await this._plot.init(width, height, margin);
    this.xlabel = xlabel;
    this.ylabel = ylabel;
    this.svgTag = this.writeTimePlot(this._dataset);
  }

  _abszisRotate = () => {
    this._plot.svg.selectAll("text")
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "end");
  }

  #getEveryHour = (y) => {
    let x = 1;
    let delta = 0.5;
    
    let steps = (y - 24) / 24;
  
    // Перебір, щоб знайти відповідне значення x
    for (let i = 0; i < steps; i++) {
      x += delta;
  
      // Зменшення кроку після кожних 4 кроків
      if ((Math.floor((x - 1) / delta)) % 4 === 0) {
        delta /= 2;
      }
    }
    
    return x;
  }

  _setAxisRanges = () => {
    this._plot.x.domain(this._plot.d3.extent(this._dataset, d => d.x)).nice();
    this._plot.y.domain(this._plot.d3.extent(this._dataset, d => d.y)).nice();
  }

  #getTimeTicks = () => {
    const minmax = this._plot.d3.extent(this._dataset, d => d.x);
    const hours = (minmax[1] - minmax[0]) / (1000 * 60 * 60);

    let tickInterval, timeFormat;
    
    if (hours <= 312) {
      tickInterval = this._plot.d3.utcHour.every(this.#getEveryHour(hours));
      timeFormat = this._plot.d3.utcFormat("%H:%M");
    } else if (hours <= 720) {
      tickInterval = this._plot.d3.utcDay.every(1);
      timeFormat = this._plot.d3.utcFormat("%d %b");
    } else if (hours <= 1440) {
      tickInterval = this._plot.d3.utcWeek.every(1);
      timeFormat = this._plot.d3.utcFormat("%d %b");
    } else {
      tickInterval = this._plot.d3.utcMonth.every(1);
      timeFormat = this._plot.d3.utcFormat("%b %Y");
    }

    return {interval : tickInterval, format : timeFormat};
  }

  _axisFormating = () => { // функцію треба доробити
    const ticksStat = this.#getTimeTicks();
    this._plot.svg.append("g")
      .attr("transform", `translate(0,${this._plot.height})`)
      .call(this._plot.d3.axisBottom(this._plot.x)
      .ticks(ticksStat.interval) 
      .tickFormat(ticksStat.format)); 

    this._abszisRotate();

    this._plot.svg.append("g")
      .call(this._plot.d3.axisLeft(this._plot.y));
  }

  _lineAdding = () => {
    const line = this._plot.d3.line()
      .x(d => this._plot.x(d.x))
      .y(d => this._plot.y(d.y));
    
    this._plot.svg.append("path")
      .datum(this._dataset)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1)
      .attr("d", line);

    this._plot.svg.append("g")
      .selectAll("dot")
      .data(this._dataset)
      .join("circle")
      .attr("cx", d => this._plot.x(d.x))
      .attr("cy", d => this._plot.y(d.y))
      .attr("r", 2)
      .attr("fill", "steelblue")
  }

  writeTimePlot = () => {
    this._plot.x = this._plot.d3.scaleUtc().range([0, this._plot.width]);
    this._plot.y = this._plot.d3.scaleLinear().range([this._plot.height, 0]);

    this._setAxisRanges();
    this._axisFormating();
    this._lineAdding();

    return this._plot.d3.select(this._plot.dom.window.document).select("body").node().innerHTML;
  }

  writeTimePlotFile = (name = "chart") => {
    this._fs.writeFileSync(`${this._config.get('Path.images')}${name}.svg`, this.svgTag);
  }
}

class linearPlot {
  _plot;
  _dataset;
  _fs = require('fs');
  _config = require('config');
  xlabel;
  ylabel;

  svgTag;

  constructor(dataset) {
    this._plot = new plot2Dmask();
    this._dataset = dataset;
  }

  init = async (width, height, margin, xlabel, ylabel) => {
    await this._plot.init(width, height, margin);
    this.xlabel = xlabel;
    this.ylabel = ylabel;
    this.svgTag = this.writePlot();
  }

  _setAxisRanges = () => {
    this._plot.x.domain(this._plot.d3.extent(this._dataset, d => d.x)).nice();
    this._plot.y.domain(this._plot.d3.extent(this._dataset, d => d.y)).nice();
  }

  _lineAdding = () => {
    const line = this._plot.d3.line()
      .x(d => this._plot.x(d.x))
      .y(d => this._plot.y(d.y));
    
    this._plot.svg.append("path")
      .datum(this._dataset)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1)
      .attr("d", line);

    this._plot.svg.append("g")
      .selectAll("dot")
      .data(this._dataset)
      .join("circle")
      .attr("cx", d => this._plot.x(d.x))
      .attr("cy", d => this._plot.y(d.y))
      .attr("r", 2)
      .attr("fill", "steelblue")
  }

  _abszisRotate = () => {
    this._plot.svg.selectAll("text")
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "end");
  }

  _axisFormating = () => { // функцію треба доробити
    this._plot.svg.append("g")
      .attr("transform", `translate(0,${this._plot.height})`)
      .call(this._plot.d3.axisBottom(this._plot.x)); 

    this._abszisRotate();

    this._plot.svg.append("g")
      .call(this._plot.d3.axisLeft(this._plot.y));
  }

  writePlot = () => {
    this._plot.x = this._plot.d3.scaleLinear().range([0, this._plot.width]);
    this._plot.y = this._plot.d3.scaleLinear().range([this._plot.height, 0]);

    this._setAxisRanges();

    this._axisFormating();
    this._lineAdding();
        
    return this._plot.d3.select(this._plot.dom.window.document).select("body").node().innerHTML;
  }

  writePlotFile = (name = "simpleChart") => {
    this._fs.writeFileSync(`${this._config.get('Path.images')}${name}.svg`, this.svgTag);
  }
}

class corelationPlot extends timePlot2D {
  _corelationDataset;

  constructor(dataset1, dataset2) {
    super(dataset1);
    this._corelationDataset = dataset2;
  }

  init = async (width, height, margin, xlabel, ylabel) => {
    await this._plot.init(width, height, margin);
    this.xlabel = xlabel;
    this.ylabel = ylabel;
    this.svgTag = this.writeTimePlot(); 
  }

  _lineAdding = () => {
    const line = this._plot.d3.line()
      .x(d => this._plot.x(d.x))
      .y(d => this._plot.y(d.y));

    this._plot.svg.append("path")
      .datum(this._dataset)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1)
      .attr("d", line);

    this._plot.svg.append("g")
      .selectAll("dot")
      .data(this._dataset)
      .join("circle")
      .attr("cx", d => this._plot.x(d.x))
      .attr("cy", d => this._plot.y(d.y))
      .attr("r", 2)
      .attr("fill", "steelblue").attr("d", line);

    this._plot.svg.append("path")
      .datum(this._corelationDataset)
      .attr("fill", "none")
      .attr("stroke", "orange")
      .attr("stroke-width", 1)
      .attr("d", line);

    this._plot.svg.append("g")
      .selectAll("dot")
      .data(this._corelationDataset)
      .join("circle")
      .attr("cx", d => this._plot.x(d.x))
      .attr("cy", d => this._plot.y(d.y))
      .attr("r", 2)
      .attr("fill", "orange").attr("d", line);
  }

  _setAxisRanges = () => {
    const extent1 = this._plot.d3.extent(this._dataset, d => d.y);
    const extent2 = this._plot.d3.extent(this._corelationDataset, d => d.y);
    
    const globalMin = Math.min(extent1[0], extent2[0]);
    const globalMax = Math.max(extent1[1], extent2[1]);
    
    const combinedExtent = [globalMin, globalMax];

    this._plot.x.domain(this._plot.d3.extent(this._dataset, d => d.x)).nice();
    this._plot.y.domain(combinedExtent).nice();
  }
}

module.exports = {
  timePlot2D,
  linearPlot,
  corelationPlot,
};

