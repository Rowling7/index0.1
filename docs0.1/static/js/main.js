// 从 data.json 加载数据
fetch("static/data/data.json")
  .then((response) => response.json())
  .then((data) => {
    const mainContainer = document.querySelector(".mainContainer");

    // 遍历每个分类
    data.forEach((category) => {
      // 创建 section 容器
      const section = document.createElement("section");
      section.classList.add(`${category.id}-section`, "snap-section", "dynamic-section");
      section.setAttribute("data-index", category.index);

      // 创建图标网格容器
      const gridContainer = document.createElement("div");
      gridContainer.classList.add("icon-grid");

      // 遍历每个图标项
      category.children.forEach((item) => {
        // 创建图标容器
        const iconItem = document.createElement("div");
        iconItem.classList.add("nav-item", "widget-icon", "dynamic-icon");
        iconItem.style.backgroundImage = `url('${item.bgImage}')`;

        // 创建文字链接
        const link = document.createElement("a");
        link.href = item.target;
        link.textContent = item.name;
        link.classList.add("dynamic-link");
        link.setAttribute("data-bs-toggle", "tooltip");
        link.setAttribute("title", item.name);

        // 创建整体容器（用于点击跳转）
        const itemContainer = document.createElement("a");
        itemContainer.href = item.target;
        itemContainer.target = "_blank";
        itemContainer.rel = "noopener noreferrer";
        itemContainer.classList.add("dynamic-item-container");


        // 组合结构
        itemContainer.appendChild(iconItem);
        itemContainer.appendChild(link);
        gridContainer.appendChild(itemContainer);
      });

      // 将网格加入 section
      section.appendChild(gridContainer);
      // 将 section 插入主容器
      mainContainer.appendChild(section);
    });

    // 初始化所有 tooltip
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((tooltipEl) => {
      new bootstrap.Tooltip(tooltipEl);
    });
  })
  .catch((error) => console.error("加载数据失败:", error));