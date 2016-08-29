import {Directive, Input, ElementRef} from "@angular/core";

@Directive({
    selector: '[header-hider]'
})

export class HeaderHider {

    @Input() headerHiderTransition: string;
    @Input() headerHiderDelay;
    @Input() headerHiderRatio;

    private scrollContent;
    private pageHeader;
    private headerHidden;
    private scrollTop;
    private opacityValue = 1;
    private opacityRatio;
    private ticking = false;
    private topPrevious;
    private opacityPrevious;

    constructor(private element: ElementRef) {
        this.headerHiderTransition = this.headerHiderTransition || "slide";
        this.headerHiderDelay = this.headerHiderDelay || 500;
        this.headerHiderRatio = this.headerHiderRatio || 0.5;
    }

    ngAfterViewInit() {
        this.scrollContent = this.element.nativeElement.querySelector("scroll-content");
        this.pageHeader = this.element.nativeElement.parentNode.querySelector("ion-header");
        this.pageHeader.css = window.getComputedStyle(this.pageHeader);
        this.pageHeader.height = this.pageHeader.css.height.replace("px", "");
        this.pageHeader.style.transition = "opacity " + (this.headerHiderDelay / 1000).toFixed(2) + "s ease-in";
        this.pageHeader.style.webkitTransition = "-webkit-transform " + (this.headerHiderDelay / 1000).toFixed(2) + "s ease-in, opacity " + (this.headerHiderDelay / 1000).toFixed(2) + "s ease-in";
        this.headerHidden = false;
        this.opacityRatio = this.opacityValue / this.pageHeader.height / 3;

        this.scrollContent.addEventListener("scroll", () => {
            if (!this.ticking) {
                window.requestAnimationFrame(() => {
                    this.onScroll();
                });
            }
            this.ticking = true;
        });
    }

    onScroll() {
        this.updateHeader();
        this.ticking = false;
    }

    updateHeader() {

        // Slide with translate
        if (this.headerHiderTransition == "slide") {
            let shouldHide = this.scrollContent.scrollTop > this.pageHeader.height;
            if (shouldHide && !this.headerHidden) {
                this.pageHeader.style.webkitTransform = "translateY(-" + this.pageHeader.height + "px)";
                this.pageHeader.style.opacity = "0";
                this.headerHidden = true;
            } else if (!shouldHide && this.headerHidden) {
                this.pageHeader.style.webkitTransform = "translateY(0)";
                this.pageHeader.style.opacity = "1";
                this.headerHidden = false;
            }
        }

        // Parallax with translate
        if (this.headerHiderTransition == "parallax") {
            let top = Math.round(this.scrollContent.scrollTop * this.headerHiderRatio);
            if ((this.topPrevious <= this.pageHeader.height || top <= this.pageHeader.height) && this.scrollContent.scrollTop >= 0) {
                this.topPrevious = top;
                this.pageHeader.style.webkitTransform = "translateY(-" + top + "px)";
            }
        }

        // Fade with opacity
        if (this.headerHiderTransition == "fade") {
            let opacityStartPoint = false;
            let opacity = 1;
            if (this.scrollContent.scrollTop >= this.pageHeader.height || this.scrollContent.scrollTop == 0) {
                opacity = parseFloat(((this.scrollContent.scrollTop - this.pageHeader.height) * this.opacityRatio).toFixed(2));
                opacityStartPoint = true;
            }

            if ((this.opacityPrevious <= 1 || opacity <= 1) && opacityStartPoint) {
                console.log("opacity: " + opacity, "scroll: " + this.scrollContent.scrollTop);
                this.opacityPrevious = opacity;
                this.pageHeader.style.opacity = 1 - opacity;
            }
        }

    }

}