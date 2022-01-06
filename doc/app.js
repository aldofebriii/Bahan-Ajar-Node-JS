//Perfomance Hook
const {PerformanceObserver, performance} = require('perf_hooks');

//Sebuah Observer
const obs = new PerformanceObserver(function(items, observer){
  console.log(items.getEntries());
  observer.disconnect();
});

obs.observe({
  entryTypes: ['measure'],
  buffered: true
});

performance.mark('loop_start');
for(let i = 0; i < 99999; i++){
  if(i === 9998){
    performance.mark('loop_near_end');
  };
};

performance.mark('all_finish');

performance.measure('Awal Hingga loop_start', 'loop_start');
performance.measure('loop_start hingga loop_near_end', 'loop_start', 'loop_near_end');
performance.measure('Awal hingga finish', 'all_finish');
