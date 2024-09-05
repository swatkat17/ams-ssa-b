/* eslint-disable no-use-before-define, object-curly-newline, function-paren-newline */
import { div, ul, li, p, a, span, sup } from '../../scripts/dom-helpers.js';
import { scrollToMe, fixYears } from '../../scripts/animations.js';
import { readBlockConfig } from '../../scripts/aem.js';

// Helper function to generate all quarters between start and end
function generateYearQuarterRange(start, end) {
  const [startYear, startQuarter] = start.split('-');
  const [endYear, endQuarter] = end.split('-');
  const yearQuarterList = [];
  let currentYear = parseInt(startYear, 10);
  let currentQuarter = parseInt(startQuarter.replace('Q', ''), 10);
  while (currentYear < parseInt(endYear, 10) || (currentYear === parseInt(endYear, 10) && currentQuarter <= parseInt(endQuarter.replace('Q', ''), 10))) {
    yearQuarterList.push({ year: currentYear, quarter: `Q${currentQuarter}` });
    currentQuarter += 1;
    if (currentQuarter > 4) {
      currentQuarter = 1;
      currentYear += 1;
    }
  }
  return yearQuarterList;
}

// find the earliest and latest year/quarter
function getEarliestAndLatest(roadmapData) {
  let earliest = null;
  let latest = null;
  roadmapData.forEach(({ year, quarter }) => {
    const current = `${year}-${quarter}`;
    if (!earliest || compareYearQuarter(current, earliest) < 0) {
      earliest = current;
    }
    if (!latest || compareYearQuarter(current, latest) > 0) {
      latest = current;
    }
  });
  return { earliest, latest };
}

// compare year and quarter
function compareYearQuarter(yq1, yq2) {
  const [year1, quarter1] = yq1.split('-').map((v) => parseInt(v.replace('Q', ''), 10));
  const [year2, quarter2] = yq2.split('-').map((v) => parseInt(v.replace('Q', ''), 10));
  if (year1 < year2 || (year1 === year2 && quarter1 < quarter2)) return -1;
  if (year1 > year2 || (year1 === year2 && quarter1 > quarter2)) return 1;
  return 0;
}

export default function decorate(block) {
  const blockConfig = readBlockConfig(block);

  // Calculate the current year and quarter
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentQuarter = `Q${Math.floor(currentMonth / 3) + 1}`;

  let activePos;
  let posIndex = 0;
  let yearIndex = 0;

  block.innerHTML = '';

  fetch(blockConfig['data-source'])
    .then((response) => response.json())
    .then((data) => {
      const roadmapData = data.data;
      const { earliest, latest } = getEarliestAndLatest(roadmapData);
      const fullYearQuarterRange = generateYearQuarterRange(earliest, latest);

      // Group data by year and quarter
      const groupData = roadmapData.reduce((acc, { year, quarter, project, description, path }) => {
        acc[year] = acc[year] || {};
        acc[year][quarter] = acc[year][quarter] || [];
        acc[year][quarter].push({ title: project, tip: description, path });
        return acc;
      }, {});

      const $heading = div({ class: 'heading' },
        'Future Vision ',
        span('(roadmap)'),
      );

      const $disclaimer = div({ class: 'disclaimer' },
        ' EA: Early Availability | GA: General Availability',
      );

      const $years = ul({ class: 'years' });

      fullYearQuarterRange.forEach(({ year, quarter }) => {
        let $year = $years.querySelector(`[data-year="${year}"]`);
        if (!$year) {
          $year = li({ class: `y clr-${yearIndex}`, 'data-year': year }, '\u00A0', div(year));
          yearIndex += 1; // Increment only for new years
        }

        let $quarters = $year.querySelector('ul.quarters');
        if (!$quarters) {
          $quarters = ul({ class: 'quarters' });
        }

        // Increment the position index for each quarter
        posIndex += 1;
        const pos = posIndex;

        // Create the quarter element and attach it
        const $quarter = li({ class: 'q', 'data-i': pos }, quarter);

        // Initial start quarter (current date)
        if (parseInt(year, 10) === currentYear && quarter === currentQuarter) {
          $quarter.classList.add('start');
          activePos = pos;
        }

        // Retrieve projects for the corresponding year/quarter if they exist
        const projects = (groupData[year] && groupData[year][quarter]) || [];
        const $projects = ul({ class: 'projects' });

        // Iterate over the projects and append them to the quarter
        projects.forEach(({ title, tip, path }, n) => {
          // Ignore empty projects
          if (title === '') return;

          // Process title for (EA) and (GA)
          let newTitle = title;
          let suffix = '';
          if (title.includes('(EA)')) {
            newTitle = title.replace('(EA)', '');
            suffix = sup({ title: 'Early Access' }, 'EA');
          }
          if (title.includes('(GA)')) {
            newTitle = newTitle.replace('(GA)', '');
            suffix = sup({ title: 'General Access' }, 'GA');
          }
          newTitle = suffix ? span(newTitle, suffix) : newTitle;

          // Create the project element and append it to the project list
          const $project = li({ class: 'p', style: `--index:${n}` },
            div(newTitle,
              div({ class: 'tooltip' },
                div(tip,
                  p(a({ class: 'btn', href: path }, 'Learn more')),
                ),
              ),
            ),
          );

          $project.addEventListener('click', () => {
            $years.querySelectorAll('.active').forEach(($p) => $p.classList.remove('active'));
            $project.classList.toggle('active');
          });

          $projects.appendChild($project);
        });

        $quarter.appendChild($projects);
        $quarters.appendChild($quarter);
        if (!$year.contains($quarters)) $year.appendChild($quarters);
        if (!$years.contains($year)) $years.appendChild($year);
      });

      const quarterObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('on');
          else entry.target.classList.remove('on');
        });
      }, {
        threshold: [0.40], root: $years,
      });
      $years.querySelectorAll('.q').forEach(($quarter) => {
        quarterObserver.observe($quarter);
      });

      function scroll(dir) {
        // return if the button is disabled
        if (
          (dir === -1 && activePos === 1) // is at start
          || (dir === 1 && activePos === posIndex) // is at end
        ) return;

        activePos += dir;
        const target = block.querySelector(`[data-i="${activePos}"]`);

        if (target) scrollToMe($years, target, 500);

        // Toggle disabled state for left and right buttons
        $left.classList.toggle('disabled', activePos === 1);
        $right.classList.toggle('disabled', activePos === posIndex);

        // Close all active projects
        $years.querySelectorAll('.active').forEach(($p) => $p.classList.remove('active'));
      }
      const $left = div({ class: 'left' }, div());
      const $right = div({ class: 'right' }, div());
      $left.addEventListener('click', () => scroll(-1));
      $right.addEventListener('click', () => scroll(1));

      const $timeline = div({ class: 'timeline' }, $years, $left, $right);

      block.append($heading, $timeline, $disclaimer);

      // scroll to start for initial scroll
      const roadMapObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const startHere = block.querySelector('.start');
            scrollToMe($years, startHere, 2000);
            // stop observing
            observer.disconnect();
          }
        });
      }, {
        threshold: [0.20],
      });
      roadMapObserver.observe($timeline);

      fixYears($years, $timeline.querySelectorAll('.y'));
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Error fetching roadmap data:', error);
    });
}
