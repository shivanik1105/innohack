// Data processing worker script
export const dataProcessorScript = `
self.onmessage = function(e) {
  const { data, operation, params } = e.data;
  
  try {
    let result;
    
    switch (operation) {
      case 'sort':
        result = sortData(data, params.key, params.direction);
        break;
      case 'filter':
        result = filterData(data, params.predicate);
        break;
      case 'aggregate':
        result = aggregateData(data, params.groupBy, params.aggregations);
        break;
      case 'transform':
        result = transformData(data, params.transformations);
        break;
      case 'analyze':
        result = analyzeData(data);
        break;
      default:
        throw new Error('Unknown operation: ' + operation);
    }
    
    self.postMessage({ success: true, result, operation });
  } catch (error) {
    self.postMessage({ success: false, error: error.message });
  }
};

function sortData(data, key, direction = 'asc') {
  return [...data].sort((a, b) => {
    const aVal = key ? a[key] : a;
    const bVal = key ? b[key] : b;
    
    if (direction === 'desc') {
      return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
    }
    return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
  });
}

function filterData(data, predicate) {
  return data.filter(item => {
    try {
      return new Function('item', 'return ' + predicate)(item);
    } catch {
      return false;
    }
  });
}

function aggregateData(data, groupBy, aggregations) {
  const groups = {};
  
  data.forEach(item => {
    const key = groupBy ? item[groupBy] : 'all';
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
  });
  
  const result = {};
  
  Object.keys(groups).forEach(key => {
    const group = groups[key];
    result[key] = {};
    
    aggregations.forEach(agg => {
      switch (agg.type) {
        case 'count':
          result[key][agg.name] = group.length;
          break;
        case 'sum':
          result[key][agg.name] = group.reduce((sum, item) => sum + (item[agg.field] || 0), 0);
          break;
        case 'avg':
          const sum = group.reduce((sum, item) => sum + (item[agg.field] || 0), 0);
          result[key][agg.name] = sum / group.length;
          break;
        case 'min':
          result[key][agg.name] = Math.min(...group.map(item => item[agg.field] || 0));
          break;
        case 'max':
          result[key][agg.name] = Math.max(...group.map(item => item[agg.field] || 0));
          break;
      }
    });
  });
  
  return result;
}

function transformData(data, transformations) {
  return data.map(item => {
    const transformed = { ...item };
    
    transformations.forEach(transform => {
      switch (transform.type) {
        case 'rename':
          if (item[transform.from]) {
            transformed[transform.to] = item[transform.from];
            delete transformed[transform.from];
          }
          break;
        case 'calculate':
          try {
            transformed[transform.field] = new Function('item', 'return ' + transform.expression)(item);
          } catch {
            transformed[transform.field] = null;
          }
          break;
        case 'format':
          if (item[transform.field]) {
            switch (transform.format) {
              case 'uppercase':
                transformed[transform.field] = String(item[transform.field]).toUpperCase();
                break;
              case 'lowercase':
                transformed[transform.field] = String(item[transform.field]).toLowerCase();
                break;
              case 'currency':
                transformed[transform.field] = new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(item[transform.field]);
                break;
            }
          }
          break;
      }
    });
    
    return transformed;
  });
}

function analyzeData(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return { error: 'Invalid or empty data' };
  }
  
  const analysis = {
    totalRecords: data.length,
    fields: {},
    summary: {}
  };
  
  // Analyze fields
  const sampleItem = data[0];
  Object.keys(sampleItem).forEach(field => {
    const values = data.map(item => item[field]).filter(val => val != null);
    const numericValues = values.filter(val => typeof val === 'number' || !isNaN(Number(val)));
    
    analysis.fields[field] = {
      type: typeof sampleItem[field],
      nullCount: data.length - values.length,
      uniqueCount: new Set(values).size,
      isNumeric: numericValues.length > values.length * 0.8
    };
    
    if (analysis.fields[field].isNumeric && numericValues.length > 0) {
      const nums = numericValues.map(Number);
      analysis.fields[field].min = Math.min(...nums);
      analysis.fields[field].max = Math.max(...nums);
      analysis.fields[field].avg = nums.reduce((a, b) => a + b, 0) / nums.length;
    }
  });
  
  return analysis;
}
`;