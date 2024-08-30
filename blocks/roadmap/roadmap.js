/* eslint-disable no-use-before-define, object-curly-newline, function-paren-newline */
import { div, ul, li, p, a, span, sup } from '../../scripts/dom-helpers.js';
import { scrollToMe, fixYears } from '../../scripts/animations.js';

// todo: p8 add history & push state

export default function decorate(block) {
  const roadMapDataUrl = block.querySelector('a').href;
  let activePos;
  let posIndex = 0;

  block.innerHTML = '';

  fetch(roadMapDataUrl)
    .then((response) => response.json())
    .then((data) => {
      const roadmapData = data.data;

      // Group data by year and quarter
      const groupData = roadmapData.reduce((acc, {
        Year,
        Quarter,
        Start,
        Project,
        Tooltip,
        Page,
      }) => {
        acc[Year] = acc[Year] || {};
        acc[Year][Quarter] = acc[Year][Quarter] || [];
        acc[Year][Quarter].push({
          Start,
          title: Project,
          tip: Tooltip,
          path: Page,
        });
        return acc;
      }, {});

      const $heading = div({ class: 'heading' },
        'Future Vision ',
        span('(roadmap)'),
      );

      const $disclaimer = div({ class: 'disclaimer' },
        ' EA: Early Availability | GA: General Availability',
      );

      // Create the <ul> list for years
      const $years = ul({ class: 'years' });
      Object.entries(groupData).forEach(([year, quarters], i) => {
        const $year = li({ class: `y clr-${i}` }, '\u00A0', div(year));

        const $quarters = ul({ class: 'quarters' });

        Object.entries(quarters).forEach(([quarter, projects]) => {
          posIndex += 1;
          const pos = posIndex;

          const $quarter = li({ class: 'q', 'data-i': pos }, quarter);

          // handle start quarter
          if (projects.some(({ Start }) => Start === 'here')) {
            $quarter.classList.add('start');
            activePos = pos;
          }

          const $projects = ul({ class: 'projects' });
          projects.forEach(({ title, tip, path }, n) => {
            // ignore empty projects
            if (title === '') return;

            // check if title contains (EA)
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

            const $project = li({ class: 'p', style: `--index:${n}` },
              div(
                newTitle,
                div({ class: 'tooltip' },
                  div(
                    tip,
                    p(a({ class: 'btn', href: path }, 'Learn more')),
                  ),
                ),
              ),
            );

            // add click event to make active & show info
            $project.addEventListener('click', () => {
              $years.querySelectorAll('.active')
                .forEach(($p) => $p.classList.remove('active'));
              $project.classList.toggle('active');
            });

            $projects.appendChild($project);
          });

          $quarters.appendChild($quarter);
          $quarter.appendChild($projects);
        });

        $years.appendChild($year);
        $year.appendChild($quarters);
      });

      const quarterObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('on');
          } else {
            entry.target.classList.remove('on');
          }
        });
      }, {
        threshold: [0.40], root: $years,
      });
      $years.querySelectorAll('.q').forEach(($quarter) => {
        quarterObserver.observe($quarter);
      });

      function scroll(dir) {
        activePos += dir;
        const target = block.querySelector(`[data-i="${activePos}"]`);
        if (target) { scrollToMe($years, target, 500); }
        // if activePos is at the start or end, disable the buttons
        if (activePos === 1) {
          $left.classList.add('disabled');
        } else {
          $left.classList.remove('disabled');
        }
        if (activePos === posIndex) {
          $right.classList.add('disabled');
        } else {
          $right.classList.remove('disabled');
        }
        // close all active projects
        $years.querySelectorAll('.active').forEach(($a) => $a.classList.remove('active'));
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
            // todo: p7 add active quarter focus animation
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
