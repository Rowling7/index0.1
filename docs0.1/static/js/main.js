fetch('static/data/data.json')
    .then(response => response.json())
    .then(data => {
        const mainContainer = document.querySelector('.mainContainer');

        data.forEach(category => {
            const section = document.createElement('section');
            section.classList.add(`${category.id}-section`, 'snap-section');
            section.style.scrollSnapAlign = 'start';
            section.style.height = '100vh';
            section.style.width = '100%';
            section.style.display = 'flex';
            section.style.flexDirection = 'column';
            section.style.alignItems = 'center';
            section.style.justifyContent = 'start';
            section.style.backgroundColor = '#f9f9f9';
            section.style.boxSizing = 'border-box';

            // 创建图标容器
            const gridContainer = document.createElement('div');
            gridContainer.style.display = 'grid';
            gridContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(100px, 1fr))';
            gridContainer.style.gap = '8px';
            gridContainer.style.width = '100%';
            gridContainer.style.padding = '0 10px';
            gridContainer.style.boxSizing = 'border-box';

            // 添加图标
            category.children.forEach(item => {
                const iconItem = document.createElement('div');
                iconItem.className = 'nav-item widget-icon';
                iconItem.style.backgroundImage = `url('${item.bgImage}')`;
                iconItem.style.backgroundSize = 'cover';
                iconItem.style.backgroundPosition = 'center';
                iconItem.style.width = '100px';
                iconItem.style.height = '100px';

                const link = document.createElement('a');
                link.href = item.target;
                link.textContent = item.name;
                link.style.display = 'block';
                link.style.textAlign = 'center';
                link.style.marginTop = '8px';
                link.style.color = '#333';
                link.style.textDecoration = 'none';

                const itemContainer = document.createElement('div');
                itemContainer.style.display = 'flex';
                itemContainer.style.flexDirection = 'column';
                itemContainer.style.alignItems = 'center';
                itemContainer.appendChild(iconItem);
                itemContainer.appendChild(link);

                gridContainer.appendChild(itemContainer);
            });

            section.appendChild(gridContainer);
            mainContainer.appendChild(section); // 插入到 mainContainer 中
        });
    })
    .catch(error => console.error('加载数据失败:', error));